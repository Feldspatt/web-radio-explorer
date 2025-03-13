/**
 * Converts a Theme object into CSS variables and applies them to the specified element
 * with smooth transitions between theme changes
 *
 * @param theme The theme object to convert to CSS variables
 * @param element The element to apply the CSS variables to (defaults to document.documentElement)
 * @param transitionDuration The duration of the transition in milliseconds (defaults to 300ms)
 */
export function applyTheme(theme: Theme, element: HTMLElement = document.documentElement, transitionDuration = 300) {
	// Helper function to convert a ColorValue to a CSS string
	const colorToCSS = (color: ColorValue): string => {
		if (color.type === "hsla") {
			return `hsla(${color.hue}, ${color.saturation}%, ${color.lightness}%, ${color.alpha})`
		}
		if (color.type === "linear-gradient") {
			const gradientColors = color.colors
				.map((c) => {
					if (c.position !== undefined) {
						return `${c.color} ${c.position}%`
					}
					return c.color
				})
				.join(", ")

			return `linear-gradient(${color.angle}deg, ${gradientColors})`
		}

		return ""
	}

	// Process ColorPair objects
	const colorPairToCSS = (prefix: string, pair: ColorPair) => {
		element.style.setProperty(`--${prefix}-text`, colorToCSS(pair.text))
		element.style.setProperty(`--${prefix}-bg`, colorToCSS(pair.bg))
		if (pair.border) {
			element.style.setProperty(`--${prefix}-border`, colorToCSS(pair.border))
		}
	}

	// Setup transition for smooth theme changes
	// First, check if transitions are already set up
	const currentTransition = element.style.getPropertyValue("transition")
	if (!currentTransition || !currentTransition.includes("--color")) {
		// Create a transition string for all color properties
		const transitionValue = `background-color ${transitionDuration}ms ease,
                            color ${transitionDuration}ms ease,
                            border-color ${transitionDuration}ms ease,
                            box-shadow ${transitionDuration}ms ease`

		// Add a rule to the stylesheet for all elements to transition CSS variables
		const styleSheet = document.createElement("style")
		styleSheet.id = "theme-transition-styles"

		// Remove any existing theme transition styles
		const existingStyles = document.getElementById("theme-transition-styles")
		if (existingStyles) {
			existingStyles.remove()
		}

		styleSheet.textContent = `
      * {
        transition: ${transitionValue};
      }
      
      /* Exclude elements where transitions might cause layout issues */
      input, button, select, textarea {
        transition: ${transitionValue}, transform 100ms ease;
      }
    `

		document.head.appendChild(styleSheet)
	}

	// Set basic theme properties
	element.style.setProperty("--theme-name", theme.name)
	element.style.setProperty("--theme-symbol", theme.symbol)

	// Set color variables
	element.style.setProperty("--color-strong", colorToCSS(theme.colors.strong))
	element.style.setProperty("--color-accent", colorToCSS(theme.colors.accent))
	element.style.setProperty("--color-hover", colorToCSS(theme.colors.hover))
	element.style.setProperty("--color-active", colorToCSS(theme.colors.active))

	// Background colors
	element.style.setProperty("--color-bg-soft", colorToCSS(theme.colors.background.soft))
	element.style.setProperty("--color-bg-hard", colorToCSS(theme.colors.background.hard))

	// Text colors
	element.style.setProperty("--color-text-soft", colorToCSS(theme.colors.text.soft))
	element.style.setProperty("--color-text-hard", colorToCSS(theme.colors.text.hard))
	element.style.setProperty("--color-text-inverse", colorToCSS(theme.colors.text.inverse))

	// Tags colors
	colorPairToCSS("tags", theme.colors.tags)

	// State colors
	colorPairToCSS("state-error", theme.colors.state.error)
	colorPairToCSS("state-online", theme.colors.state.online)
	colorPairToCSS("state-loading", theme.colors.state.loading)

	// Action colors
	colorPairToCSS("action-playing", theme.colors.action.playing)
	colorPairToCSS("action-paused", theme.colors.action.paused)
	colorPairToCSS("action-retry", theme.colors.action.retry)

	// Typography
	element.style.setProperty("--font-primary", theme.typography.primaryFont)
	element.style.setProperty("--font-secondary", theme.typography.secondaryFont)

	// Border radius
	element.style.setProperty("--border-radius-input", theme.borderRadius.input)
	element.style.setProperty("--border-radius-general", theme.borderRadius.general)

	// Box shadow
	element.style.setProperty("--card-box-shadow", theme.cardBoxShadow)

	// Apply a theme data attribute to the element for potential CSS targeting
	element.setAttribute("data-theme", theme.name.toLowerCase().replace(/\s+/g, "-"))
}
