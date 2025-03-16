import React from 'react';

enum PlayerState {
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    ERROR = 'ERROR',
    LOADING = 'LOADING',
}

type PlayButtonProps = {
    state: PlayerState;
    onClick: () => void;
    onRetry?: () => void;
};

const PlayButton: React.FC<PlayButtonProps> = ({ state, onClick, onRetry }) => {
    // Render retry button for error state
    if (state === PlayerState.ERROR) {
        return (
            <button
                className="player-button action-retry"
        onClick={onRetry}
        aria-label="Retry connection"
        >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12a9 9 0 1 1-4.22-7.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </button>
    );
    }

    // Render loading spinner
    if (state === PlayerState.LOADING) {
        return (
            <button
                className="player-button"
        onClick={onClick}
        aria-label="Loading"
        disabled
        >
        <svg
            className="loading-spinner"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
        <path
            d="M12 2C6.48 2 2 6.48 2 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
            />
            </svg>
            </button>
    );
    }

    // Render play button
    if (state === PlayerState.PAUSED) {
        return (
            <button
                className="player-button action-paused"
        onClick={onClick}
        aria-label="Play"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="8,4 18,12 8,20"/>
            </svg>
            </button>
    );
    }

    // Render pause button (PLAYING state)
    return (
        <button
            className="player-button action-playing"
    onClick={onClick}
    aria-label="Pause"
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
        </svg>
        </button>
);
};

export default PlayButton;