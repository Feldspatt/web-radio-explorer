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
    useEffect(() => {
        if(station === null) return

        setIsSafeMode(false);
        setIsLoading(true);
        setPlaybackError(false); // Reset error state when station changes

        // We'll attempt to play automatically when station changes
        setIsPlaying(true);

        if (audioRef.current && safeAudioRef.current) {
            window.localStorage.setItem('lastStation', JSON.stringify(station));

            audioRef.current.src = station.url;
            safeAudioRef.current.src = station.url;

            // Always load the audio
            audioRef.current.load();
            safeAudioRef.current.load();

            // Don't try to play here - we'll let the canplay event handler do it
            // This is the key change - remove the play attempt here
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
                        audioContextRef.current.resume();
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

                    // Start visualizer if we're in normal mode and playing
                    if (!isSafeMode && isPlaying) {
                        drawVisualizer();
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

    // Visualizer function
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

    // Toggle play/pause
    const togglePlayPause = () => {
        console.info("toggled play pause");
        if (!audioRef.current || !safeAudioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;
        const audioElement = !isSafeMode ? audioRef.current : safeAudioRef.current;

        // Reset error state when attempting to play
        setPlaybackError(false);

        // If audio context is suspended (browser policy), resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        setIsLoading(true); // Add loading state when toggling

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
            setIsLoading(false);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        } else {
            audioElement.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                    drawVisualizer();
                })
                .catch(error => {
                    console.error("Error playing audio:", error);

                    // Try safe mode if normal playback fails
                    if (!isSafeMode && safeAudioRef.current) {
                        setIsSafeMode(true);
                        safeAudioRef.current.play()
                            .then(() => {
                                setIsPlaying(true);
                                setIsLoading(false);
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
                            className="retry-button"
                            onClick={retryConnection}
                        >
                            🔄 Retry
                        </button>
                    ) : (
                        <button
                            className={`play-pause-button ${isPlaying ? 'playing' : ''}`}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? '❚❚' : '▶'}
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