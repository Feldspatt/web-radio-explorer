import React, { useCallback, useMemo } from "react";
import "../style/PlayButton.css";

enum PlayerState {
	PLAYING = "PLAYING",
	PAUSED = "PAUSED",
	ERROR = "ERROR",
	LOADING = "LOADING",
}

type PlayButtonProps = {
	state: PlayerState;
	onClick: () => void;
	onRetry?: () => void;
};

const PlayButton: React.FC<PlayButtonProps> = ({ state, onClick, onRetry }) => {
	const activeClass = useMemo(() => {
		switch (state) {
			case PlayerState.PLAYING:
				return "action-playing";
			case PlayerState.PAUSED:
				return "action-paused";
			case PlayerState.ERROR:
				return "action-retry";
			case PlayerState.LOADING:
				return "action-loading";
			default:
				return "action-playing";
		}
	}, [state]);

	const handleCLick = useCallback(() => {
		switch (state) {
			// @ts-ignore
			case PlayerState.PLAYING:
			case PlayerState.PAUSED:
				return onClick();
			case PlayerState.ERROR:
				return onRetry?.();
			case PlayerState.LOADING:
			default:
				console.log(`Pressing playing button while ${state}.`);
		}
	}, [state]);

	// Render retry button for error state

	return (
		<button
			className={`play-button ${activeClass}`}
			onClick={handleCLick}
			aria-label="Play button"
		>
			{state === PlayerState.ERROR && (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M21 12a9 9 0 1 1-4.22-7.59"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M21 3v5h-5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			)}
			{state === PlayerState.LOADING && (
				<svg
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke-width="1"
						opacity="0.3"
					/>

					<path
						d="M12 2A10 10 0 0 1 22 12"
						stroke-width="2.5"
						stroke-linecap="round"
					/>

					<circle cx="12" cy="12" r="1" />
					<circle cx="12" cy="6" r="0.8" opacity="0.8" />
					<circle cx="18" cy="12" r="0.8" opacity="0.8" />
					<circle cx="12" cy="18" r="0.8" opacity="0.8" />
					<circle cx="6" cy="12" r="0.8" opacity="0.8" />
				</svg>
			)}
			{state === PlayerState.PAUSED && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<polygon points="8,4 18,12 8,20" />
				</svg>
			)}
			{state === PlayerState.PLAYING && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<rect x="6" y="4" width="4" height="16" />
					<rect x="14" y="4" width="4" height="16" />
				</svg>
			)}
		</button>
	);
};

export default PlayButton;
