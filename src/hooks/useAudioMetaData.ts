import { useState, useEffect, RefObject } from 'react';

// Define types for the metadata
interface AudioMetadata {
    title: string;
    artist: string;
    isLoading: boolean;
}

/**
 * A React hook that extracts metadata (song title and artist) from an audio stream.
 * Safely handles null audio references.
 *
 * @param {RefObject<HTMLAudioElement> | null} audioRef - Reference to an HTML audio element (can be null)
 * @returns {AudioMetadata} Object containing song title, artist information, and loading state
 */
const useAudioMetadata = (audioRef: RefObject<HTMLAudioElement> | null): AudioMetadata => {
    const [metadata, setMetadata] = useState<AudioMetadata>({
        title: '',
        artist: '',
        isLoading: false
    });

    useEffect(() => {
        // Early return if audioRef is null or doesn't have a current value
        if (!audioRef || !audioRef.current) {
            setMetadata(prev => ({ ...prev, isLoading: false }));
            return;
        }

        // Mark as loading while we set up listeners
        setMetadata(prev => ({ ...prev, isLoading: true }));

        const audio = audioRef.current;

        // Helper function to parse "Artist - Title" format
        const parseTrackString = (trackString: string) => {
            const parts = trackString.split(' - ');
            if (parts.length >= 2) {
                setMetadata({
                    artist: parts[0].trim(),
                    title: parts.slice(1).join(' - ').trim(),
                    isLoading: false
                });
            } else {
                setMetadata({
                    title: trackString.trim(),
                    artist: '',
                    isLoading: false
                });
            }
        };

        // Handler for metadata updates
        const handleMetadataUpdate = () => {
            try {
                // Try to extract metadata from MediaSession API if available
                if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
                    const mediaMetadata = navigator.mediaSession.metadata;
                    setMetadata({
                        title: mediaMetadata.title || '',
                        artist: mediaMetadata.artist || '',
                        isLoading: false
                    });
                    return;
                }

                // Fall back to checking audio element directly
                if (audio.textTracks && audio.textTracks.length > 0) {
                    // Some streams may provide metadata via text tracks
                    const metadataTrack = Array.from(audio.textTracks).find(
                        track => track.kind === 'metadata'
                    );

                    if (metadataTrack) {
                        metadataTrack.mode = 'hidden';
                        metadataTrack.addEventListener('cuechange', () => {
                            if (metadataTrack.activeCues && metadataTrack.activeCues.length > 0) {
                                const cue = metadataTrack.activeCues[0];

                                // Try to access any available properties that might contain metadata
                                // using type casting and optional chaining to avoid errors
                                try {
                                    // Some implementations use custom properties
                                    const anyTypeCue = cue as any;

                                    if (anyTypeCue.data) {
                                        // Handle data property if it exists
                                        const data = anyTypeCue.data;
                                        if (typeof data === 'object') {
                                            if (data.title || data.artist) {
                                                setMetadata({
                                                    title: data.title || '',
                                                    artist: data.artist || '',
                                                    isLoading: false
                                                });
                                                return;
                                            }
                                        } else if (typeof data === 'string') {
                                            parseTrackString(data);
                                            return;
                                        }
                                    }

                                    // For VTTCue standard implementations
                                    if (anyTypeCue.getCueAsHTML) {
                                        const cueContent = anyTypeCue.getCueAsHTML().textContent;
                                        if (cueContent) {
                                            parseTrackString(cueContent);
                                            return;
                                        }
                                    }

                                    // Last resort: try stringifying the entire cue object
                                    const cueString = cue.toString();
                                    if (cueString && cueString !== '[object TextTrackCue]') {
                                        parseTrackString(cueString);
                                    }
                                } catch (error) {
                                    console.error('Error parsing cue metadata:', error);
                                    setMetadata(prev => ({ ...prev, isLoading: false }));
                                }
                            }
                        });
                    }
                }

                // If we get here and haven't found metadata, update loading state
                setMetadata(prev => ({
                    ...prev,
                    isLoading: false
                }));
            } catch (error) {
                console.error('Error extracting audio metadata:', error);
                setMetadata(prev => ({ ...prev, isLoading: false }));
            }
        };

        // Listen for Icecast/Shoutcast metadata updates
        const handleIcecastMetadata = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent && customEvent.detail) {
                const { title = '' } = customEvent.detail;
                parseTrackString(title);
            }
        };

        // Additional metadata extraction from the src attribute for some stream types
        const tryExtractMetadataFromStreamUrl = () => {
            if (!audio || !audio.src) return;

            const audioSource = audio.src;
            if (audioSource && audioSource.includes('?')) {
                const urlParams = new URLSearchParams(audioSource.split('?')[1]);
                const songInfo = urlParams.get('song') || urlParams.get('title');
                if (songInfo) {
                    parseTrackString(songInfo);
                } else {
                    setMetadata(prev => ({ ...prev, isLoading: false }));
                }
            } else {
                setMetadata(prev => ({ ...prev, isLoading: false }));
            }
        };

        // Set up event listeners
        audio.addEventListener('loadedmetadata', handleMetadataUpdate);
        audio.addEventListener('play', handleMetadataUpdate);

        // For Icecast/Shoutcast streams
        audio.addEventListener('icestats', handleIcecastMetadata);
        audio.addEventListener('metadata', handleIcecastMetadata);

        // Check for metadata in URL parameters
        audio.addEventListener('loadedmetadata', tryExtractMetadataFromStreamUrl);

        // Some radio streams may update metadata during playback
        const metadataInterval = setInterval(() => {
            handleMetadataUpdate();
            tryExtractMetadataFromStreamUrl();
        }, 5000);

        // Initial attempt
        handleMetadataUpdate();

        return () => {
            // Clean up all event listeners
            if (audio) {
                audio.removeEventListener('loadedmetadata', handleMetadataUpdate);
                audio.removeEventListener('play', handleMetadataUpdate);
                audio.removeEventListener('icestats', handleIcecastMetadata);
                audio.removeEventListener('metadata', handleIcecastMetadata);
                audio.removeEventListener('loadedmetadata', tryExtractMetadataFromStreamUrl);
            }
            clearInterval(metadataInterval);
        };
    }, [audioRef]);

    return metadata;
};

export default useAudioMetadata;