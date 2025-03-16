import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayButton from './PlayButton'; // Import the new component
import '../style/RadioPlayer.css';

type RadioStation = {
    url: string;
    name: string;
    favicon: string;
};

type RadioPlayerProps = {
    station: Pick<RadioStation, 'url' | 'name' | 'favicon'> | null;
    autoPlay: boolean;
};

enum PlayerState {
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    ERROR = 'ERROR',
    LOADING = 'LOADING',
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station, autoPlay = false }: RadioPlayerProps) => {
    const [volume, setVolume] = useState(80);
    const [state, setState] = useState<PlayerState>(PlayerState.PAUSED);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Initialize audio context and analyzer
    useEffect(() => {
        if (audioRef.current === null) return;

        if (!audioContextRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
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
    }, [volume]);

    // Handle station changes
    useEffect(() => {
        if (station === null) return;

        // Reset state for new station
        setState(PlayerState.LOADING);

        if (autoPlay) {
            // We'll attempt to play automatically when station changes
            // But we don't set PLAYING state yet, as the audio isn't ready
        }

        if (audioRef.current) {
            // Stop any current playback before changing sources
            audioRef.current.pause();
            audioRef.current.src = station.url;
            // Always load the audio
            audioRef.current.load();
        } else {
            setState(PlayerState.PAUSED);
        }
    }, [station, autoPlay]);

    // Handle audio events and playback
    useEffect(() => {
        if (!audioRef.current) return;

        const handleCanPlay = () => {
            if (state === PlayerState.LOADING) {
                // Clear error state when stream can play
                if (autoPlay) {
                    // Make sure audioContext is resumed
                    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                        audioContextRef.current.resume().catch(console.error);
                    }

                    audioRef.current?.play().then(() => {
                        setState(PlayerState.PLAYING);
                    }).catch(e => {
                        console.error("Error auto-playing after can play event:", e);
                        setState(PlayerState.ERROR);
                    });
                } else {
                    setState(PlayerState.PAUSED);
                }
            }
        };

        const handleError = (e: Event) => {
            console.error("Audio error event:", e);
            setState(PlayerState.ERROR);
        };

        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.addEventListener('error', handleError);

        const savedAudioRef = audioRef.current;

        return () => {
            savedAudioRef.removeEventListener('canplay', handleCanPlay);
            savedAudioRef.removeEventListener('error', handleError);
        };
    }, [state, autoPlay]);

    const togglePlayPause = useCallback(() => {
        console.info("toggled play pause");
        if (!audioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;

        // If audio contexts is suspended (browser policy), resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(console.error);
        }

        // First determine what to do based on current playing state
        if (state === PlayerState.PLAYING) {
            // PAUSE LOGIC
            audioRef.current.pause();
            setState(PlayerState.PAUSED);
        } else if (state === PlayerState.PAUSED) {
            // PLAY LOGIC
            setState(PlayerState.LOADING);

            audioRef.current.play()
                .then(() => {
                    setState(PlayerState.PLAYING);
                })
                .catch(error => {
                    console.error("Error playing audio:", error);
                    setState(PlayerState.ERROR);
                });
        }
    }, [state]);

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
    }, [togglePlayPause]);

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
        if (!audioRef.current) return;

        setState(PlayerState.LOADING);

        // Reload the audio and try playing again
        audioRef.current.load();

        audioRef.current.play()
            .then(() => {
                setState(PlayerState.PLAYING);
            })
            .catch(error => {
                console.error("Error during retry:", error);
                setState(PlayerState.ERROR);
            });
    }, []);

    return (
        <div className="radio-player">
            <audio ref={audioRef} crossOrigin="anonymous" />

            {station && <div className="station-info">
                {station.favicon ? (
                    <img
                        src={station.favicon}
                        alt={`${station.name} logo`}
                        className="station-favicon"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 16.3c2.1-1.4 4.5-2.2 7-2.2s4.9.8 7 2.2"/></svg>';
                        }}
                    />
                ) : (
                    <div className="text-soft station-favicon-placeholder">📻</div>
                )}
                <h2 className="strong station-name">{station.name}</h2>
            </div>
            }

            <PlayButton
                state={state}
                onClick={togglePlayPause}
                onRetry={retryConnection}
            />

            <div className="volume-control">
                <input
                    id="volume"
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    aria-label="Volume control"
                />
                <label htmlFor={"volume"} className="volume-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                        <path d="M16.5 12c0-1.77-.91-3.33-2.29-4.24l1.07-1.77A7.99 7.99 0 0118.5 12a7.99 7.99 0 01-3.22 6.01l-1.07-1.77A5.99 5.99 0 0016.5 12z" fill="currentColor"/>
                        <path d="M19.07 4.93l-1.06 1.06A10.97 10.97 0 0121 12c0 3.03-1.23 5.78-3.21 7.79l1.06 1.06A12.96 12.96 0 0023 12c0-3.6-1.43-6.87-3.93-9.07z" fill="currentColor"/>
                    </svg>
                </label>
            </div>
        </div>
    );
}

export default RadioPlayer;