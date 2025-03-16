import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import PlayButton from "./PlayButton"; // Import the new component
import "../style/RadioPlayer.css";

type RadioStation = {
	url: string;
	name: string;
	favicon: string;
};

type RadioPlayerProps = {
	station: Pick<RadioStation, "url" | "name" | "favicon"> | null;
	autoPlay: boolean;
};

enum PlayerState {
	PLAYING = "PLAYING",
	PAUSED = "PAUSED",
	ERROR = "ERROR",
	LOADING = "LOADING",
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({
	station,
	autoPlay = false,
}: RadioPlayerProps) => {
	const [volume, setVolume] = useState(80);
	const [state, setState] = useState<PlayerState>(PlayerState.PAUSED);
	const audioContextRef = useRef<AudioContext | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	// Initialize audio context and analyzer
	useEffect(() => {
		if (audioRef.current === null) return;

		if (!audioContextRef.current) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const AudioContext =
				window.AudioContext ||
				(window as any).webkitAudioContext;
			audioContextRef.current = new AudioContext();
		}

		// Set initial volume
		if (audioRef.current) {
			audioRef.current.volume = volume / 100;
		}

		// Load saved volume from localStorage
		try {
			const savedVolume = window.localStorage.getItem("volume");
			if (savedVolume) setVolume(Number.parseInt(savedVolume));
		} catch (error) {
			console.error(
				"Error reading volume from localStorage:",
				error,
			);
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
					if (
						audioContextRef.current &&
						audioContextRef.current.state ===
							"suspended"
					) {
						audioContextRef.current
							.resume()
							.catch(console.error);
					}

					audioRef.current
						?.play()
						.then(() => {
							setState(PlayerState.PLAYING);
						})
						.catch((e) => {
							console.error(
								"Error auto-playing after can play event:",
								e,
							);
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

		audioRef.current.addEventListener("canplay", handleCanPlay);
		audioRef.current.addEventListener("error", handleError);

		const savedAudioRef = audioRef.current;

		return () => {
			savedAudioRef.removeEventListener("canplay", handleCanPlay);
			savedAudioRef.removeEventListener("error", handleError);
		};
	}, [state, autoPlay]);

	const togglePlayPause = useCallback(() => {
		console.info("toggled play pause");
		if (!audioRef.current || !audioContextRef.current) return;

		const audioContext = audioContextRef.current;

		// If audio contexts is suspended (browser policy), resume it
		if (audioContext.state === "suspended") {
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

			audioRef.current
				.play()
				.then(() => {
					setState(PlayerState.PLAYING);
				})
				.catch((error) => {
					console.error("Error playing audio:", error);
					setState(PlayerState.ERROR);
				});
		}
	}, [state]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle space if the active element is not an input or textarea
			if (
				event.code === "Space" &&
				document.activeElement?.tagName &&
				!["INPUT", "TEXTAREA"].includes(
					document.activeElement.tagName,
				) &&
				document.activeElement.getAttribute(
					"contenteditable",
				) !== "true"
			) {
				event.preventDefault(); // Prevent page scrolling
				togglePlayPause(); // Your media play/pause function
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [togglePlayPause]);

	// Handle volume change
	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newVolume = Number.parseInt(e.target.value);
			setVolume(newVolume);
			try {
				window.localStorage.setItem("volume", e.target.value);
			} catch (error) {
				console.error(
					"Error saving volume to localStorage:",
					error,
				);
			}
		},
		[],
	);

	// Try to connect again when in error state
	const retryConnection = useCallback(() => {
		if (!audioRef.current) return;

		setState(PlayerState.LOADING);

		// Reload the audio and try playing again
		audioRef.current.load();

		audioRef.current
			.play()
			.then(() => {
				setState(PlayerState.PLAYING);
			})
			.catch((error) => {
				console.error("Error during retry:", error);
				setState(PlayerState.ERROR);
			});
	}, []);

	return (
		<div className="radio-player">
			<audio ref={audioRef} crossOrigin="anonymous" />

			<div className="station-info">
				{station?.favicon ? (
					<img
						src={station.favicon}
						alt={`${station.name} logo`}
						className="station-favicon"
						onError={(e) => {
							(e.target as HTMLImageElement).src =
								'data:image/svg+xml;utf8,<svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 16.3c2.1-1.4 4.5-2.2 7-2.2s4.9.8 7 2.2"/></svg>';
						}}
					/>
				) : (
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<title>Radio svg</title>
						<rect
							x="2"
							y="8"
							width="20"
							height="12"
							rx="2"
						/>
						<path d="M6 15h.01" />
						<circle cx="16" cy="14" r="2" />
						<path d="M4 8 16 3" />
						<path d="M8 8v4" />
					</svg>
				)}
				<span className="strong station-name">
					{station?.name ?? "Select a station."}
				</span>
			</div>

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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<path
							d="M7,9 L10.5,6 L10.5,18 L7,15 L4,15 L4,9 L7,9"
							fill="currentColor"
						/>
						<path
							d="M13,8 Q15.5,12 13,16"
							stroke="currentColor"
							stroke-width="1.5"
							fill="none"
						/>
						<path
							d="M15,6 Q19,12 15,18"
							stroke="currentColor"
							stroke-width="1.5"
							fill="none"
						/>
					</svg>
				</label>
			</div>
		</div>
	);
};

export default RadioPlayer;
