export const darkTheme: Theme = {
	name: "Enhanced Dark Theme",
	symbol: "🌃",
	colors: {
		// Primary accent colors - shifted to a more vibrant blue-purple
		strong: {
			type: "hsla",
			hue: 230,
			saturation: 85,
			lightness: 60,
			alpha: 1
		},
		accent: {
			type: "hsla",
			hue: 230,
			saturation: 75,
			lightness: 65,
			alpha: 1
		},
		hover: {
			type: "hsla",
			hue: 230,
			saturation: 70,
			lightness: 70,
			alpha: 1
		},
		active: {
			type: "hsla",
			hue: 230,
			saturation: 90,
			lightness: 55,
			alpha: 1
		},

		background: {
			soft: {
				type: "hsla",
				hue: 225,
				saturation: 15,
				lightness: 15,
				alpha: 1
			},
			hard: {
				type: "linear-gradient",
				angle: 45,
				colors: [
					{
						color: "hsla(250, 0%, 5%, 1)",
						position: 0
					},
					{
						color: "hsla(250, 0%, 12%, 1)",
						position: 100
					}
				]
			}
		},

		// Text colors - improved contrast while reducing eye strain
		text: {
			soft: {
				type: "hsla",
				hue: 220,
				saturation: 5,
				lightness: 75,
				alpha: 1
			},
			hard: {
				type: "hsla",
				hue: 220,
				saturation: 3,
				lightness: 92,
				alpha: 1
			},
			inverse: {
				type: "hsla",
				hue: 220,
				saturation: 10,
				lightness: 10,
				alpha: 1
			}
		},

		// Tags appearance - more vibrant and distinguishable
		tags: {
			text: {
				type: "hsla",
				hue: 0,
				saturation: 0,
				lightness: 100,
				alpha: 1
			},
			bg: {
				type: "hsla",
				hue: 230,
				saturation: 75,
				lightness: 45,
				alpha: 1
			},
			border: {
				type: "hsla",
				hue: 230,
				saturation: 80,
				lightness: 55,
				alpha: 1
			}
		},

		// State indicators - more distinctive colors
		state: {
			error: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "hsla",
					hue: 0,
					saturation: 85,
					lightness: 42,
					alpha: 1
				},
				border: {
					type: "hsla",
					hue: 0,
					saturation: 90,
					lightness: 48,
					alpha: 1
				}
			},
			online: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "hsla",
					hue: 140,
					saturation: 75,
					lightness: 35,
					alpha: 1
				},
				border: {
					type: "hsla",
					hue: 140,
					saturation: 80,
					lightness: 40,
					alpha: 1
				}
			},
			loading: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "hsla",
					hue: 45,
					saturation: 85,
					lightness: 48,
					alpha: 1
				},
				border: {
					type: "hsla",
					hue: 45,
					saturation: 90,
					lightness: 53,
					alpha: 1
				}
			}
		},

		// Action button states - more dynamic gradients
		action: {
			playing: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "linear-gradient",
					angle: 135,
					colors: [
						{
							color: "hsla(220, 95%, 50%, 1)",
							position: 0
						},
						{
							color: "hsla(260, 95%, 50%, 1)",
							position: 100
						}
					]
				}
			},
			paused: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "hsla",
					hue: 250,
					saturation: 70,
					lightness: 45,
					alpha: 1
				}
			},
			retry: {
				text: {
					type: "hsla",
					hue: 0,
					saturation: 0,
					lightness: 100,
					alpha: 1
				},
				bg: {
					type: "hsla",
					hue: 30,
					saturation: 85,
					lightness: 52,
					alpha: 1
				}
			}
		}
	},

	// Typography settings - enhanced readability
	typography: {
		primaryFont: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		secondaryFont: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
	},

	// Border radius settings - slightly more rounded
	borderRadius: {
		input: "25px",
		general: "10px"
	},

	// Card shadows - more depth and subtlety
	cardBoxShadow: "0 6px 16px rgba(0, 0, 0, 0.45), 0 3px 8px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)"
}
