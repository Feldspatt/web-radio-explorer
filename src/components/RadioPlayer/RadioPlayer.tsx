import React, { useState, useEffect, useRef } from 'react';
import './RadioPlayer.css';

type RadioPlayerProps = {
    station: Pick<RadioStation, 'url' | 'name' | 'favicon'>
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station } : RadioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
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

    useEffect(() => {
        setIsSafeMode(false)
        if (audioRef.current && safeAudioRef.current) {

            window.localStorage.setItem('lastStation', JSON.stringify(station))
            const wasPlaying = !audioRef.current.paused || !safeAudioRef.current.paused;

            audioRef.current.src = station.url
            safeAudioRef.current.src = station.url

            if (wasPlaying) {
                audioRef.current.load();
                audioRef.current.play().catch(e => {
                    console.error("Error playing audio with unsafe player:", e)
                    setIsSafeMode(true)
                    if(safeAudioRef.current) {
                        safeAudioRef.current.load()
                        safeAudioRef.current.play().catch((error)=> {
                            console.error("Error playing audio with safe player:", error);
                        })
                    }
                });
            }
        }
    }, [station.url]);

    // Handle volume changes
    useEffect(() => {
        if(audioRef.current) audioRef.current.volume = volume / 100
        if(safeAudioRef.current) safeAudioRef.current.volume = volume / 100;
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
        if (!audioRef.current || !safeAudioRef.current || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;
        const audioElement = !isSafeMode? audioRef.current : safeAudioRef.current


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