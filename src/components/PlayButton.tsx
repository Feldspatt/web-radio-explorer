import type React from "react"
import { useCallback, useMemo } from "react"
import "../style/PlayButton.css"
import { SvgSpinner } from "./SvgSpinner.tsx"

enum PlayerState {
	PLAYING = "PLAYING",
	PAUSED = "PAUSED",
	ERROR = "ERROR",
	LOADING = "LOADING"
}

type PlayButtonProps = {
	state: PlayerState
	onClick: () => void
	onRetry?: () => void
}

const PlayButton: React.FC<PlayButtonProps> = ({ state, onClick, onRetry }) => {
	const activeClass = useMemo(() => {
		switch (state) {
			case PlayerState.PLAYING:
				return "action-playing"
			case PlayerState.PAUSED:
				return "action-paused"
			case PlayerState.ERROR:
				return "action-retry"
			case PlayerState.LOADING:
				return "action-loading"
			default:
				return "action-playing"
		}
	}, [state])

	const handleCLick = useCallback(() => {
		switch (state) {
			case PlayerState.PLAYING:
			case PlayerState.PAUSED:
				return onClick()
			case PlayerState.ERROR:
				return onRetry?.()
			default:
				console.log(`Pressing playing button while ${state}.`)
		}
	}, [state, onClick, onRetry])

	return (
		<button type={"button"} className={`play-button ${activeClass}`} onClick={handleCLick} aria-label='Play button'>
			{state === PlayerState.ERROR && (
				<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<title>Error</title>
					<path
						d='M21 12a9 9 0 1 1-4.22-7.59'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path d='M21 3v5h-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
				</svg>
			)}
			{state === PlayerState.LOADING && <SvgSpinner />}
			{state === PlayerState.PAUSED && (
				<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
					<title>Paused</title>
					<polygon points='8,4 18,12 8,20' />
				</svg>
			)}
			{state === PlayerState.PLAYING && (
				<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
					<title>Playing</title>
					<rect x='6' y='4' width='4' height='16' />
					<rect x='14' y='4' width='4' height='16' />
				</svg>
			)}
		</button>
	)
}

export default PlayButton
