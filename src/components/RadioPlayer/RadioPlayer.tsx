import React, { useState, useEffect, useRef } from 'react';
import './RadioPlayer.css';

interface RadioPlayerProps {
    sourceUrl: string;
    stationName?: string; // Added station name as an optional prop
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ sourceUrl, stationName = "Web Radio" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const audioRef= useRef<HTMLAudioElement>(null)
    const safeAudioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        // if(audioRef.current){
        //     audioRef.current.src = sourceUrl;
        //     audioRef.current.play().then()
        // }
    }, [sourceUrl]);

    // Initialize Web Audio API
    useEffect(() => {
        const initializeAudio = () => {

            // audio unsafe (with analyser)
            if(audioRef.current === null) return

            // Create audio context
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            // Create source node
            const sourceNode = audioContext.createMediaElementSource(audioRef.current)

            // Create analyzer node (for visualization)
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // Connect the nodes
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

            // Set initial volume
            audioRef.current.volume = volume/100;

            return () => {
                // Cleanup
                if (audioContext.state !== 'closed') {
                    // analyser.disconnect();
                }
            };
        };

        initializeAudio();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Handle source URL changes
    useEffect(() => {
        if (audioRef.current) {

            window.localStorage.setItem('lastStation', JSON.stringify({ sourceUrl, stationName }))
            const wasPlaying = !audioRef.current.paused;

            // Update source
            audioRef.current.src = sourceUrl;

            // If it was playing, reload and continue playing
            if (wasPlaying) {
                audioRef.current.load();
                audioRef.current.play().catch(e => console.error("Error playing after URL change:", e));
            }
        }
    }, [sourceUrl]);

    // Handle volume changes
    useEffect(() => {
        if(audioRef.current) audioRef.current.volume = volume / 100;
    }, [volume]);

    useEffect(()=>{
        const savedVolume = window.localStorage.getItem('volume')
        if(savedVolume)setVolume(parseInt(savedVolume))
    }, [])

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
        if (!audioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;
        const audioElement = audioRef.current;

        // If audio context is suspended (browser policy), resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (isPlaying) {
            audioElement.pause();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        } else {
            audioElement.play()
                .then(() => {
                    drawVisualizer();
                })
                .catch(error => {
                    console.error("Error playing audio:", error);
                });
        }

        setIsPlaying(!isPlaying);
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value));
        window.localStorage.setItem('volume', e.target.value);
    };

    return (
        <div className="radio-player">
            <audio
                ref={audioRef}
                crossOrigin="anonymous"
            />
            <audio
                ref={safeAudioRef}
            />

            <div className="station-header">
                <h2 className="station-name">{stationName}</h2>
                <div className={`status-indicator ${isPlaying ? 'online' : 'paused'}`}>
                    {isPlaying ? 'ON AIR' : 'PAUSED'}
                </div>
            </div>

            <div className="controls">
                <button
                    className={`play-pause-button ${isPlaying ? 'playing' : ''}`}
                    onClick={togglePlayPause}
                >
                    {isPlaying ? '❚❚' : '▶'}
                </button>

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
        </div>
    );
};

export default RadioPlayer;