import React, { useState, useEffect, useRef, useCallback } from 'react';
import RadioVisualizer from '../RadioVisualizer/RadioVisualizer.tsx';
import './RadioPlayer.css';

type RadioStation = {
    url: string;
    name: string;
    favicon: string;
};

type RadioPlayerProps = {
    station: Pick<RadioStation, 'url' | 'name' | 'favicon'> | null;
};

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station }: RadioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(80);
    const [playbackError, setPlaybackError] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const [isSafeMode, setIsSafeMode] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const safeAudioRef = useRef<HTMLAudioElement>(null);

    // Initialize audio context and analyzer
    useEffect(() => {
        if (audioRef.current === null) return;

        if (!audioContextRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }

        // Only set up source node if it hasn't been created yet
        if (!audioRef.current.srcObject) {
            try {
                const sourceNode = audioContextRef.current.createMediaElementSource(audioRef.current);

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

        // Set initial volume
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }

        // Load saved volume from localStorage
        try {
            const savedVolume = window.localStorage.getItem('volume');
            if (savedVolume) setVolume(parseInt(savedVolume));
        } catch (error) {
            console.error("Error reading volume from localStorage:", error);
        }
    }, [volume]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume / 100;
        if (safeAudioRef.current) safeAudioRef.current.volume = volume / 100;
    }, [volume]);

    // Handle station changes
    useEffect(() => {
        if (station === null) return;

        // Reset state for new station
        setIsSafeMode(false);
        setIsLoading(true);
        setPlaybackError(false);
        setIsPlaying(true); // We'll attempt to play automatically when station changes

        if (audioRef.current && safeAudioRef.current) {
            try {
                window.localStorage.setItem('lastStation', JSON.stringify(station));
            } catch (error) {
                console.error("Error saving station to localStorage:", error);
            }

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
                        audioContextRef.current.resume().catch(console.error);
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

        const savedAudioRef = audioRef.current;
        const savedSafeAudioRef = safeAudioRef.current;

        return () => {
            savedAudioRef.removeEventListener('canplay', handleCanPlay);
            savedAudioRef.removeEventListener('error', handlePrimaryError);
            savedSafeAudioRef.removeEventListener('canplay', handleCanPlay);
            savedSafeAudioRef.removeEventListener('error', handleSafeError);
        };
    }, [isPlaying, isSafeMode]);

    const togglePlayPause = useCallback(() => {
        console.info("toggled play pause");
        if (!audioRef.current || !safeAudioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;

        // Reset error state when attempting to play
        setPlaybackError(false);

        // If audio contexts is suspended (browser policy), resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(console.error);
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
    }, [isPlaying, isSafeMode]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle space if the active element is not an input or textarea
            if (event.code === 'Space' &&
                (document.activeElement?.tagName && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) &&
                document.activeElement.getAttribute('contenteditable') !== 'true') {

                event.preventDefault(); // Prevent page scrolling
                togglePlayPause(); // Your media play/pause function
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, isSafeMode, togglePlayPause]);

    // Handle volume change
    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        try {
            window.localStorage.setItem('volume', e.target.value);
        } catch (error) {
            console.error("Error saving volume to localStorage:", error);
        }
    }, []);

    // Try to connect again when in error state
    const retryConnection = useCallback(() => {
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
            })
            .catch(error => {
                console.error("Error during retry with primary audio:", error);
                if (!safeAudioRef.current) return;

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
    }, []);

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
                </div>
            ) : (
                <>
                    <div className="station-header">
                        <span className="inline">
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
                                    <path d="M21 12a9 9 0 1 1-4.22-7.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

                    {/* Radio visualizer */}
                    <RadioVisualizer
                        isPlaying={isPlaying}
                        isSafeMode={isSafeMode}
                        analyserRef={analyserRef}
                        station={station}
                    />
                </>
            )}
        </div>
    );
};

export default RadioPlayer;