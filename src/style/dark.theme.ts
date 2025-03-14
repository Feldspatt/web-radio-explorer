export const darkTheme: Theme = {
    name: "Dark Theme",
    symbol: "🌙",
    colors: {
        // Primary accent colors
        strong: {
            type: "hsla",
            hue: 220,
            saturation: 100,
            lightness: 60,
            alpha: 1
        },
        accent: {
            type: "hsla",
            hue: 220,
            saturation: 90,
            lightness: 65,
            alpha: 1
        },
        hover: {
            type: "hsla",
            hue: 220,
            saturation: 85,
            lightness: 70,
            alpha: 1
        },
        active: {
            type: "hsla",
            hue: 220,
            saturation: 100,
            lightness: 55,
            alpha: 0.9
        },

        // Background shades
        background: {
            soft: {
                type: "hsla",
                hue: 220,
                saturation: 13,
                lightness: 18,
                alpha: 1
            },
            hard: {
                type: "hsla",
                hue: 220,
                saturation: 16,
                lightness: 12,
                alpha: 1
            }
        },

        // Text colors
        text: {
            soft: {
                type: "hsla",
                hue: 220,
                saturation: 9,
                lightness: 78,
                alpha: 1
            },
            hard: {
                type: "hsla",
                hue: 220,
                saturation: 5,
                lightness: 95,
                alpha: 1
            },
            inverse: {
                type: "hsla",
                hue: 220,
                saturation: 10,
                lightness: 12,
                alpha: 1
            }
        },

        // Tags appearance
        tags: {
            text: {
                type: "hsla",
                hue: 0,
                saturation: 0,
                lightness: 98,
                alpha: 1
            },
            bg: {
                type: "hsla",
                hue: 220,
                saturation: 80,
                lightness: 50,
                alpha: 1
            },
            border: {
                type: "hsla",
                hue: 220,
                saturation: 85,
                lightness: 60,
                alpha: 1
            }
        },

        // State indicators
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
                    saturation: 80,
                    lightness: 45,
                    alpha: 1
                },
                border: {
                    type: "hsla",
                    hue: 0,
                    saturation: 85,
                    lightness: 50,
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
                    hue: 120,
                    saturation: 70,
                    lightness: 35,
                    alpha: 1
                },
                border: {
                    type: "hsla",
                    hue: 120,
                    saturation: 75,
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
                    hue: 40,
                    saturation: 90,
                    lightness: 50,
                    alpha: 1
                },
                border: {
                    type: "hsla",
                    hue: 40,
                    saturation: 95,
                    lightness: 55,
                    alpha: 1
                }
            }
        },

        // Action button states
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
                            color: "hsla(210, 90%, 50%, 1)",
                            position: 0
                        },
                        {
                            color: "hsla(240, 90%, 50%, 1)",
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
                    hue: 240,
                    saturation: 65,
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
                    hue: 35,
                    saturation: 90,
                    lightness: 55,
                    alpha: 1
                }
            }
        }
    },

    // Typography settings
    typography: {
        primaryFont: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        secondaryFont: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
    },

    // Border radius settings
    borderRadius: {
        input: "6px",
        general: "8px"
    },

    // Card shadows
    cardBoxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)"
};