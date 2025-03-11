import React, { useEffect, useRef, useContext, useCallback } from 'react';
import { ThemeContext } from "../../contexts/ThemeContext.tsx";

// Define proper types for colors
interface HSLAColor {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
}

interface RadioVisualizerProps {
    isPlaying: boolean;
    isSafeMode: boolean;
    analyserRef: React.RefObject<AnalyserNode | null>;
    station: Pick<RadioStation, 'url' | 'name' | 'favicon'> | null;
}

const RadioVisualizer: React.FC<RadioVisualizerProps> = ({
                                                             isPlaying,
                                                             isSafeMode,
                                                             analyserRef,
                                                             station
                                                         }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const themeContext = useContext(ThemeContext);
    const currentStationRef = useRef<string | null>(null);

    // Memoize the HSLA parser function to avoid recreating it on every render
    const parseHSLA = useCallback((hsla: string): HSLAColor => {
        const match = hsla.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%,\s*(\d+\.\d+|\d+)\)/);
        if (match) {
            return {
                hue: parseInt(match[1], 10),
                saturation: parseInt(match[2], 10),
                lightness: parseInt(match[3], 10),
                alpha: parseFloat(match[4]),
            };
        }
        return { hue: 220, saturation: 100, lightness: 50, alpha: 1 };
    }, []);

    // Memoize the function to get current theme colors
    // This will only be recreated when the theme name changes
    const getCurrentColors = useCallback(() => {
        const themeStyles = getComputedStyle(document.documentElement);
        const hueStart = parseHSLA(themeStyles.getPropertyValue('--bar-hue-start').trim());
        const hueEnd = parseHSLA(themeStyles.getPropertyValue('--bar-hue-end').trim());
        return { hueStart, hueEnd };
    }, [parseHSLA, themeContext.theme.name]);

    // Memoize the stop animation function
    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, []);

    // Memoize the visualizer drawing function
    const drawVisualizer = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current) return;

        stopAnimation();

        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            // Request next animation frame first to ensure smooth animation
            animationFrameRef.current = requestAnimationFrame(draw);

            // Get frequency data for the current frame
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            // Get the CURRENT colors directly from CSS variables each frame
            const { hueStart, hueEnd } = getCurrentColors();

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                // Interpolate hue based on frequency intensity dynamically
                const hue = hueStart.hue + (hueEnd.hue - hueStart.hue) * (dataArray[i] / 255);
                const saturation = hueStart.saturation + (hueEnd.saturation - hueStart.saturation) * (dataArray[i] / 255);
                const lightness = hueStart.lightness + (hueEnd.lightness - hueStart.lightness) * (dataArray[i] / 255);
                const alpha = hueStart.alpha + (hueEnd.alpha - hueStart.alpha) * (dataArray[i] / 255);

                // Set the color for the current bar using dynamic HSLA
                ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }, [analyserRef, getCurrentColors, stopAnimation]);

    // Memoize the fallback animation drawing function
    const drawFallbackAnimation = useCallback(() => {
        if (!canvasRef.current) return;

        const stationUrl = station?.url || null;
        currentStationRef.current = stationUrl;

        stopAnimation();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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
            if (!isPlaying || currentStationRef.current !== stationUrl) {
                stopAnimation();
                return;
            }

            animationFrameRef.current = requestAnimationFrame(draw);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(40, 40, 40, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;

            waves.forEach((wave) => {
                ctx.beginPath();
                ctx.moveTo(0, centerY);

                for (let x = 0; x < canvas.width; x += 3) {
                    const y = centerY + Math.sin(x * wave.period + time + wave.phase) * wave.amplitude;
                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            time += 0.03;
        };

        draw();
    }, [isPlaying, station, stopAnimation]);

    // Effect for theme changes - use MutationObserver for direct DOM changes
    useEffect(() => {
        if (!isPlaying || isSafeMode) return;

        const observer = new MutationObserver(() => {
            if (isPlaying && !isSafeMode) {
                stopAnimation();
                drawVisualizer();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        return () => observer.disconnect();
    }, [isPlaying, isSafeMode, stopAnimation, drawVisualizer]);

    useEffect(() => {
        if (isPlaying) {
            stopAnimation();
            if (!isSafeMode) {
                drawVisualizer();
            } else {
                drawFallbackAnimation();
            }
        } else {
            stopAnimation();
        }

        return stopAnimation;
    }, [isPlaying, isSafeMode, station, themeContext.theme.name, stopAnimation, drawVisualizer, drawFallbackAnimation]);

    useEffect(() => {
        if (isPlaying && !isSafeMode) {
            // Restart visualizer when theme changes
            stopAnimation();
            drawVisualizer();
        }
    }, [themeContext.theme.name, isPlaying, isSafeMode, stopAnimation, drawVisualizer]);

    return (
        <div className="visualizer-container">
            <canvas ref={canvasRef} className="visualizer" />
        </div>
    );
};

export default RadioVisualizer;