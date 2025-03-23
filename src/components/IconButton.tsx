import "../style/IconButton.css"
import type { ReactNode } from "react"

type IconButtonProp = {
	children: ReactNode
	handleClick: () => void
	isFilled?: boolean
	disabled?: boolean
}

export function IconButton({ children, handleClick, isFilled, disabled }: IconButtonProp) {
	return (
		<button
			disabled={disabled}
			type='button'
			onClick={(ev) => {
				ev.stopPropagation()
				handleClick()
			}}
			className={`icon-button ${isFilled ? "filled" : ""}`}
		>
			{children}
		</button>
	)
}
