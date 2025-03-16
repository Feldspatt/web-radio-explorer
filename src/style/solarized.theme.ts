export const solarizedTheme: Theme = {
	name: "Solarized",
	symbol: "🌞",
	colors: {
		strong: {
			type: "hsla",
			hue: 194,
			saturation: 80,
			lightness: 35,
			alpha: 1,
		},
		accent: {
			type: "hsla",
			hue: 194,
			saturation: 60,
			lightness: 45,
			alpha: 1,
		},
		hover: {
			type: "hsla",
			hue: 194,
			saturation: 70,
			lightness: 40,
			alpha: 1,
		},
		active: {
			type: "hsla",
			hue: 194,
			saturation: 80,
			lightness: 30,
			alpha: 1,
		},
		background: {
			soft: {
				type: "hsla",
				hue: 44,
				saturation: 30,
				lightness: 95,
				alpha: 1,
			},
			hard: {
				type: "hsla",
				hue: 44,
				saturation: 40,
				lightness: 98,
				alpha: 1,
			},
		},
		text: {
			soft: {
				type: "hsla",
				hue: 194,
				saturation: 25,
				lightness: 40,
				alpha: 1,
			},
			hard: {
				type: "hsla",
				hue: 194,
				saturation: 30,
				lightness: 20,
				alpha: 1,
			},
			inverse: {
				type: "hsla",
				hue: 44,
				saturation: 40,
				lightness: 98,
				alpha: 1,
			},
		},
		tags: {
			text: {
				type: "hsla",
				hue: 194,
				saturation: 70,
				lightness: 30,
				alpha: 1,
			},
			bg: {
				type: "hsla",
				hue: 44,
				saturation: 40,
				lightness: 95,
				alpha: 1,
			},
			border: {
				type: "hsla",
				hue: 44,
				saturation: 50,
				lightness: 90,
				alpha: 1,
			},
		},
		state: {
			error: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 70,
					lightness: 45,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
			online: {
				text: {
					type: "hsla",
					hue: 120,
					saturation: 50,
					lightness: 35,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
			loading: {
				text: {
					type: "hsla",
					hue: 44,
					saturation: 90,
					lightness: 40,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
		},
		action: {
			playing: {
				text: {
					type: "hsla",
					hue: 120,
					saturation: 50,
					lightness: 35,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
			paused: {
				text: {
					type: "hsla",
					hue: 44,
					saturation: 90,
					lightness: 40,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
			retry: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 60,
					lightness: 45,
					alpha: 1,
				},
				bg: {
					type: "hsla",
					hue: 44,
					saturation: 30,
					lightness: 95,
					alpha: 1,
				},
			},
		},
	},
	typography: {
		primaryFont:
			'"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
		secondaryFont: '"Source Serif Pro", Georgia, serif',
	},
	borderRadius: {
		input: "3px",
		general: "6px",
	},
	cardBoxShadow: "0 2px 6px rgba(101, 123, 131, 0.12)",
};
