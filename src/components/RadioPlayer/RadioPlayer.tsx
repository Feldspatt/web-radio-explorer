import React, { useState, useEffect, useRef } from 'react';
import './RadioPlayer.css';

type RadioPlayerProps = {
    station: Pick<RadioStation, 'url' | 'name' | 'favicon'> | null
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station } : RadioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(80);
    const [playbackError, setPlaybackError] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [isSafeMode, setIsSafeMode] = useState(false)

    const audioRef= useRef<HTMLAudioElement>(null)
    const safeAudioRef= useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (audioRef.current === null) return;

        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }

        let sourceNode;
        if (!audioRef.current.srcObject) {
            try {
                sourceNode = audioContextRef.current.createMediaElementSource(audioRef.current);

                const analyser = audioContextRef.current.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;

                sourceNode.connect(analyser);
                analyser.connect(audioContextRef.current.destination);
            } catch (error) {
                console.error("Error setting up audio nodes:", error);
                return;
            }
        }

        if (audioRef.current) {
            audioRef.current.volume = volume/100;
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Handle station changes
    // Handle station changes
    useEffect(() => {
        if(station === null) return

        // IMMEDIATE ANIMATION STOP - Cancel any ongoing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;

            // Also clear the canvas if it exists
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
        }

        // Reset state for new station
        setIsSafeMode(false);
        setIsLoading(true);
        setPlaybackError(false);
        setIsPlaying(true); // We'll attempt to play automatically when station changes

        if (audioRef.current && safeAudioRef.current) {
            window.localStorage.setItem('lastStation', JSON.stringify(station));

            // Stop any current playback before changing sources
            audioRef.current.pause();
            safeAudioRef.current.pause();

            audioRef.current.src = station.url;
            safeAudioRef.current.src = station.url;

            // Always load the audio
            audioRef.current.load();
            safeAudioRef.current.load();
        } else {
            setIsLoading(false);
        }
    }, [station]);

    // Handle audio events and playback
    useEffect(() => {
        if (!audioRef.current || !safeAudioRef.current) return;

        const handleCanPlay = () => {
            setIsLoading(false);
            setPlaybackError(false); // Clear error state when stream can play

            // Only try to play if isPlaying is true
            if (isPlaying) {
                const currentPlayer = !isSafeMode ? audioRef.current : safeAudioRef.current;
                if (currentPlayer) {
                    // Make sure audioContext is resumed
                    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                        audioContextRef.current.resume().then()
                    }

                    currentPlayer.play().catch(e => {
                        console.error(`Error auto-playing after can play event in ${isSafeMode ? 'safe' : 'normal'} mode:`, e);
                        // Only set error if both players fail
                        if (isSafeMode) {
                            setPlaybackError(true);
                            setIsPlaying(false);
                        } else {
                            setIsSafeMode(true);
                            safeAudioRef.current?.play().catch(safeError => {
                                console.error("Safe mode playback failed too:", safeError);
                                setPlaybackError(true);
                                setIsPlaying(false);
                            });
                        }
                    });

                    // Start visualizer if playing
                    if (isPlaying) {
                        if (!isSafeMode) {
                            // Use frequency data visualizer for normal mode
                            drawVisualizer();
                        } else {
                            // Use fallback animation for safe mode
                            drawFallbackAnimation();
                        }
                    }
                }
            }
        };

        const handlePrimaryError = (e: Event) => {
            console.error("Primary audio error event:", e);
            // Don't set error state yet, try safe mode first
            if (!isSafeMode && safeAudioRef.current) {
                setIsSafeMode(true);
                if (isPlaying) {
                    safeAudioRef.current.play().catch(safeError => {
                        console.error("Safe mode playback also failed:", safeError);
                        setIsPlaying(false);
                        setIsLoading(false);
                        setPlaybackError(true); // Only set error if both fail
                    });
                }
            }
        };

        const handleSafeError = (e: Event) => {
            console.error("Safe audio error event:", e);
            // Only set error state if we're already in safe mode
            if (isSafeMode) {
                setIsPlaying(false);
                setIsLoading(false);
                setPlaybackError(true);
            }
        };

        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.addEventListener('error', handlePrimaryError);
        safeAudioRef.current.addEventListener('canplay', handleCanPlay);
        safeAudioRef.current.addEventListener('error', handleSafeError);

        return () => {
            audioRef.current?.removeEventListener('canplay', handleCanPlay);
            audioRef.current?.removeEventListener('error', handlePrimaryError);
            safeAudioRef.current?.removeEventListener('canplay', handleCanPlay);
            safeAudioRef.current?.removeEventListener('error', handleSafeError);
        };
    }, [isPlaying, isSafeMode]);

    // Handle volume changes
    useEffect(() => {
        if(audioRef.current) audioRef.current.volume = volume / 100;
        if(safeAudioRef.current) safeAudioRef.current.volume = volume / 100;
    }, [volume]);

    useEffect(()=>{
        const savedVolume = window.localStorage.getItem('volume');
        if(savedVolume) setVolume(parseInt(savedVolume));
    }, []);

    // Regular audio visualizer that uses frequency data
    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                // Color gradient from blue to purple
                const r = Math.floor((dataArray[i] / 255) * 100) + 50;
                const g = 50;
                const b = 200;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    };

    // Store current station in a ref to track changes
    const currentStationRef = useRef<string | null>(null);

// Improved fallback animation with station change detection
    const drawFallbackAnimation = () => {
        if (!canvasRef.current) return;

        // Store current station URL to detect changes
        const stationUrl = station?.url || null;
        currentStationRef.current = stationUrl;

        // Cancel any existing animation frame when starting a new one
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas immediately to ensure no artifacts
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let time = 0;
        const waveCount = 2;

        const waves = Array(waveCount).fill(0).map((_, i) => ({
            amplitude: 8 + Math.random() * 10,
            period: 0.4 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
            color: `rgba(220, 220, 220, ${0.6 - (i * 0.2)})`
        }));

        const draw = () => {
            // Check if station has changed or playback stopped
            if (!isPlaying || currentStationRef.current !== stationUrl) {
                // Cancel animation and clear canvas if station changed or not playing
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            // Continue animation only if playing the same station
            animationFrameRef.current = requestAnimationFrame(draw);

            // Clear with full reset
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Monochrome background
            ctx.fillStyle = 'rgba(40, 40, 40, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;

            // Draw each wave
            waves.forEach((wave) => {
                ctx.beginPath();
                ctx.moveTo(0, centerY);

                // Create a sine wave with better spacing
                for (let x = 0; x < canvas.width; x += 3) {
                    const y = centerY + Math.sin(x * wave.period + time + wave.phase) * wave.amplitude;
                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            })

            time += 0.03;
        };

        draw();
    };

    // First, improve the keyboard event listener in your useEffect
    useEffect(() => {
        const handleKeyDown = (event: any) => {
            // Only handle space if the active element is not an input or textarea
            if (event.code === 'Space' &&
                (document.activeElement?.tagName && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) &&
                    document.activeElement.getAttribute('contenteditable') !== 'true')) {

                event.preventDefault(); // Prevent page scrolling
                togglePlayPause(); // Your media play/pause function
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, isSafeMode]); // Add dependencies to ensure the listener has the latest state

    const togglePlayPause = () => {
        console.info("toggled play pause");
        if (!audioRef.current || !safeAudioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;

        // Reset error state when attempting to play
        setPlaybackError(false);

        // If audio contexts is suspended (browser policy), resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume().then();
        }

        // First determine what to do based on current playing state
        if (isPlaying) {
            // PAUSE LOGIC
            setIsLoading(false); // No need for loading state when pausing

            // Pause BOTH audio elements regardless of mode
            audioRef.current.pause();
            safeAudioRef.current.pause();

            // Update state AFTER pausing
            setIsPlaying(false);

            // Cancel any animations
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;

                // Clear canvas if it exists
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            }
        } else {
            // PLAY LOGIC
            setIsLoading(true);

            // Determine which player to use
            const audioElement = !isSafeMode ? audioRef.current : safeAudioRef.current;

            audioElement.play()
                .then(() => {
                    // Make sure the OTHER player is paused
                    if (!isSafeMode) {
                        safeAudioRef.current?.pause();
                    } else {
                        audioRef.current?.pause();
                    }

                    setIsPlaying(true);
                    setIsLoading(false);

                    // Always cancel any existing animation before starting a new one
                    if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                        animationFrameRef.current = null;
                    }

                    // Start the appropriate animation based on mode
                    if (!isSafeMode) {
                        drawVisualizer();
                    } else {
                        drawFallbackAnimation();
                    }
                })
                .catch(error => {
                    console.error("Error playing audio:", error);

                    // Try safe mode if normal playback fails
                    if (!isSafeMode && safeAudioRef.current) {
                        setIsSafeMode(true);

                        // Make sure the primary player is paused
                        audioRef.current?.pause();

                        safeAudioRef.current.play()
                            .then(() => {
                                setIsPlaying(true);
                                setIsLoading(false);

                                // Make sure to cancel any existing animation
                                if (animationFrameRef.current) {
                                    cancelAnimationFrame(animationFrameRef.current);
                                    animationFrameRef.current = null;
                                }

                                drawFallbackAnimation(); // Use fallback animation in safe mode
                            })
                            .catch(safeError => {
                                console.error("Safe mode playback failed too:", safeError);
                                setIsLoading(false);
                                setPlaybackError(true); // Only set error if both players fail
                                setIsPlaying(false);
                            });
                    } else {
                        setIsLoading(false);
                        setPlaybackError(true); // Set error if safe mode already failed
                        setIsPlaying(false);
                    }
                });
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value));
        window.localStorage.setItem('volume', e.target.value);
    };

    // Try to connect again when in error state
    const retryConnection = () => {
        if (!audioRef.current || !safeAudioRef.current) return;

        setPlaybackError(false);
        setIsLoading(true);
        setIsSafeMode(false); // Reset to primary audio first

        // Reload the audio and try playing again
        audioRef.current.load();
        safeAudioRef.current.load();

        audioRef.current.play()
            .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
                drawVisualizer();
            })
            .catch(error => {
                console.error("Error during retry with primary audio:", error);
                if(!safeAudioRef.current) return

                // Try safe mode if primary fails
                setIsSafeMode(true);
                safeAudioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        setIsLoading(false);
                        drawFallbackAnimation(); // Use fallback animation in safe mode
                    })
                    .catch(safeError => {
                        console.error("Safe mode playback also failed during retry:", safeError);
                        setIsLoading(false);
                        setIsPlaying(false);
                        setPlaybackError(true);
                    });
            });
    };

    return (
        <div className="radio-player card">
            <audio
                ref={audioRef}
                crossOrigin="anonymous"
            />

            <audio
                ref={safeAudioRef}
            />

            {!station ? (
                <div className="empty-state">
                    <div className="icon">📻</div>
                    <h2>Select a station to start listening</h2>
                    <p>Browse and filter stations from the list above</p>
                </div>): (<>


                <div className="station-header">
                <span className={"inline"}>
                    <div className="station-logo">
                        {station.favicon ? (
                            <img
                                src={station.favicon}
                                alt={`${station.name} logo`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 16.3c2.1-1.4 4.5-2.2 7-2.2s4.9.8 7 2.2"/></svg>';
                                }}
                            />
                        ) : (
                            <div className="default-logo">📻</div>
                        )}
                    </div>
                    <h2 className="station-name">{station.name}</h2>
                </span>
                    <div className={`status-indicator ${isLoading ? 'loading' : playbackError ? 'error' : isPlaying ? 'online' : 'paused'}`}>
                        {isLoading ? 'LOADING...' : playbackError ? 'UNAVAILABLE' : isPlaying ? 'ON AIR' : 'PAUSED'}
                    </div>
                </div>

                <div className="controls">
                    {playbackError ? (
                        <button
                            className="play-button retry"
                            onClick={retryConnection}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12a9 9 0 1 1-4.22-7.59" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    ) : (
                        <button
                            className={`play-button ${isPlaying ? 'play' : 'pause'}`}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <rect x="3" y="2" width="8" height="20"/>
                                    <rect x="13" y="2" width="8" height="20"/>
                                </svg>

                                : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <polygon points="6,4 20,12 6,20"/>
                            </svg>}
                        </button>
                    )}

                    <div className="volume-control">
                        <span className="volume-icon">🔊</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                        <span className="volume-value">{volume}%</span>
                    </div>
                </div>

                <div className="visualizer-container">
                    <canvas ref={canvasRef} className="visualizer" />
                </div>
            </>)}
        </div>
    );
};

export default RadioPlayer;