import React, {useEffect, useRef, useContext, useCallback, useLayoutEffect} from 'react';
import { ThemeContext } from "../contexts/ThemeContext.tsx";

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
                                                             station,
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
    const getCurrentColors = useCallback(() => {
        const themeStyles = getComputedStyle(document.documentElement);
        const hueStart = parseHSLA(themeStyles.getPropertyValue('--color-visualizer-start').trim());
        const hueEnd = parseHSLA(themeStyles.getPropertyValue('--color-visualizer-end').trim());
        return { hueStart, hueEnd };
    }, [parseHSLA, themeContext?.theme.name]);

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

    // Memoize the visualizer drawing function - modified for center expansion and visual improvements
    const drawVisualizer = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current) return;

        stopAnimation();

        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Improved settings for frequency analysis
        analyser.fftSize = 512; // Higher FFT size for more detailed frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // For smooth animation
        const smoothingFactor = 0.3;
        const prevDataArray = new Uint8Array(bufferLength).fill(0);

        const draw = () => {
            // Request next animation frame first to ensure smooth animation
            animationFrameRef.current = requestAnimationFrame(draw);

            // Get frequency data for the current frame
            analyser.getByteFrequencyData(dataArray);

            // Apply smoothing between frames for a more pleasing visual effect
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = (smoothingFactor * dataArray[i]) + ((1 - smoothingFactor) * prevDataArray[i]);
                prevDataArray[i] = dataArray[i];
            }

            // Clear canvas with transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Optimized bar rendering for the wider visualization
            const barSpacing = 1;
            const barWidth = Math.max(2, (canvas.width / (bufferLength * 0.75)) - barSpacing);
            let x = 0;

            // Center line for the bars to expand from
            const centerY = canvas.height / 2;

            // Get the CURRENT colors directly from CSS variables each frame
            const { hueStart, hueEnd } = getCurrentColors();

            // Visual improvement: draw a thin center line
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hueStart.hue}, ${hueStart.saturation}%, ${hueStart.lightness}%, 0.2)`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.stroke();

            // Only use a portion of the frequency data for better visual distribution
            // Focus on the more audible range by skipping very low frequencies
            const startIndex = Math.floor(bufferLength * 0.05);
            const endIndex = Math.floor(bufferLength * 0.75);

            for (let i = startIndex; i < endIndex; i++) {
                // Apply a frequency-based scaling to emphasize mid-range frequencies
                const frequencyWeight = 1 - Math.pow((i - (endIndex + startIndex) / 2) / ((endIndex - startIndex) / 2), 2) * 0.5;

                // Calculate bar height with frequency weighting
                const intensity = dataArray[i] / 255 * frequencyWeight;
                const maxHalfHeight = canvas.height / 2 - 1;
                const barHalfHeight = Math.min(intensity * maxHalfHeight, maxHalfHeight);

                // Interpolate hue based on frequency intensity dynamically
                const hue = hueStart.hue + (hueEnd.hue - hueStart.hue) * intensity;
                const saturation = hueStart.saturation + (hueEnd.saturation - hueStart.saturation) * intensity;
                const lightness = hueStart.lightness + (hueEnd.lightness - hueStart.lightness) * intensity;
                const alpha = Math.min(0.2 + intensity * 0.8, 1); // More dynamic transparency

                // Set the color for the current bar using dynamic HSLA
                ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;

                // Draw the bar centered on the middle line, expanding in both directions
                ctx.fillRect(x, centerY - barHalfHeight, barWidth, barHalfHeight * 2);

                if (intensity > 0.7) {
                    ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
                    ctx.shadowBlur = 4;
                    ctx.fillRect(x, centerY - barHalfHeight, barWidth, barHalfHeight * 2);
                    ctx.shadowBlur = 0; // Reset shadow for next bar
                }

                x += barWidth + barSpacing;
            }
        };

        draw();
    }, [analyserRef, getCurrentColors, stopAnimation]);

    // Memoize the fallback animation drawing function - enhanced version
    const drawFallbackAnimation = useCallback(() => {
        if (!canvasRef.current) return;

        const stationUrl = station?.url || null;
        currentStationRef.current = stationUrl;

        stopAnimation();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let time = 0;
        const waveCount = 3; // More waves for a richer visual
        const centerY = canvas.height / 2;

        // Create more diverse and visually interesting waves
        const waves = Array(waveCount).fill(0).map((_, i) => ({
            amplitude: Math.min(canvas.height / 4 - i * 2, canvas.height / 2 - 2),
            period: 0.3 + (i * 0.1),
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + (i * 0.005),
            color: `hsla(${220 + i * 20}, 70%, ${50 + i * 10}%, ${0.5 - (i * 0.1)})`
        }));

        const draw = () => {
            if (!isPlaying || currentStationRef.current !== stationUrl) {
                stopAnimation();
                return;
            }

            animationFrameRef.current = requestAnimationFrame(draw);

            // Clear with transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw a subtle center line
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(220, 220, 220, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.stroke();

            waves.forEach((wave) => {
                ctx.beginPath();

                // Create a smoother wave path with more points
                for (let x = 0; x < canvas.width; x += 2) {
                    // Use a combination of sine waves for more organic movement
                    const primaryWave = Math.sin(x * wave.period + time + wave.phase) * wave.amplitude;
                    const secondaryWave = Math.sin(x * wave.period * 2 + time * 1.5) * (wave.amplitude * 0.2);
                    const y = centerY + primaryWave + secondaryWave;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                // Visual improvement: use a gradient stroke
                const gradient = ctx.createLinearGradient(0, centerY - wave.amplitude, 0, centerY + wave.amplitude);
                gradient.addColorStop(0, wave.color.replace(')', ', 0.9)').replace('hsla', 'hsla'));
                gradient.addColorStop(0.5, wave.color);
                gradient.addColorStop(1, wave.color.replace(')', ', 0.9)').replace('hsla', 'hsla'));

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();

                // Update time at different rates for each wave
                time += wave.speed;
            });
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
    }, [isPlaying, isSafeMode, station, themeContext?.theme.name, stopAnimation, drawVisualizer, drawFallbackAnimation]);

    useLayoutEffect(() => {
        if (isPlaying && !isSafeMode) {
            // Restart visualizer when theme changes
            stopAnimation();
            drawVisualizer();
        }
    }, [themeContext?.theme.name, isPlaying, isSafeMode, stopAnimation, drawVisualizer]);

    // Canvas resize observer to handle responsive sizing
    useEffect(() => {
        if (!canvasRef.current) return;

        const resizeCanvas = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const container = canvas.parentElement;
                if (container) {
                    // Set physical canvas dimensions to match the container's display size
                    // Use devicePixelRatio for sharper rendering on high-DPI screens
                    const dpr = window.devicePixelRatio || 1;
                    canvas.width = container.clientWidth * dpr;
                    canvas.height = container.clientHeight * dpr;

                    // Scale the context to account for the pixel ratio
                    const ctx = canvas.getContext('2d', { alpha: true });
                    if (ctx) {
                        ctx.scale(dpr, dpr);
                    }

                    if (isPlaying) {
                        stopAnimation();
                        if (!isSafeMode) {
                            drawVisualizer();
                        } else {
                            drawFallbackAnimation();
                        }
                    }
                }
            }
        };

        // Set initial size
        resizeCanvas();

        // Create ResizeObserver to handle container resize
        const resizeObserver = new ResizeObserver(resizeCanvas);
        if (canvasRef.current.parentElement) {
            resizeObserver.observe(canvasRef.current.parentElement);
        }

        window.addEventListener('resize', resizeCanvas);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isPlaying, isSafeMode, stopAnimation, drawVisualizer, drawFallbackAnimation]);

    return (
            <canvas
                ref={canvasRef}
                className="visualizer"
                style={{
                    display: "block"
                }}
            />
    );
};

export default RadioVisualizer;