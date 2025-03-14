export const highContrastTheme: Theme = {
    name: 'High Contrast',
    symbol: '🔆',
    colors: {
        strong: {
            type: 'hsla',
            hue: 220,
            saturation: 100,
            lightness: 50,
            alpha: 1
        },
        accent: {
            type: 'hsla',
            hue: 220,
            saturation: 100,
            lightness: 60,
            alpha: 1
        },
        hover: {
            type: 'hsla',
            hue: 220,
            saturation: 100,
            lightness: 45,
            alpha: 1
        },
        active: {
            type: 'hsla',
            hue: 220,
            saturation: 100,
            lightness: 40,
            alpha: 1
        },
        background: {
            soft: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 95,
                alpha: 1
            },
            hard: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 100,
                alpha: 1
            }
        },
        text: {
            soft: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 20,
                alpha: 1
            },
            hard: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 0,
                alpha: 1
            },
            inverse: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 100,
                alpha: 1
            }
        },
        tags: {
            text: {
                type: 'hsla',
                hue: 0,
                saturation: 0,
                lightness: 100,
                alpha: 1
            },
            bg: {
                type: 'hsla',
                hue: 220,
                saturation: 100,
                lightness: 50,
                alpha: 1
            },
            border: {
                type: 'hsla',
                hue: 220,
                saturation: 100,
                lightness: 40,
                alpha: 1
            }
        },
        state: {
            error: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 100,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 85,
                    lightness: 45,
                    alpha: 1
                }
            },
            online: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 100,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 120,
                    saturation: 75,
                    lightness: 35,
                    alpha: 1
                }
            },
            loading: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 100,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 40,
                    saturation: 100,
                    lightness: 45,
                    alpha: 1
                }
            }
        },
        action: {
            playing: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 100,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 120,
                    saturation: 75,
                    lightness: 35,
                    alpha: 1
                }
            },
            paused: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 0,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 40,
                    saturation: 100,
                    lightness: 60,
                    alpha: 1
                }
            },
            retry: {
                text: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 0,
                    lightness: 100,
                    alpha: 1
                },
                bg: {
                    type: 'hsla',
                    hue: 0,
                    saturation: 85,
                    lightness: 45,
                    alpha: 1
                }
            }
        }
    },
    typography: {
        primaryFont: '"Fira Sans", "Segoe UI", Roboto, sans-serif',
        secondaryFont: '"Roboto Slab", Georgia, serif'
    },
    borderRadius: {
        input: '4px',
        general: '4px'
    },
    cardBoxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)'
};