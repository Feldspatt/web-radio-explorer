export const nordicTheme: Theme = {
    name: "Nordic",
    symbol: '❄️',
    colors: {
        strong: {
            type: "hsla",
            hue: 210,
            saturation: 10,
            lightness: 45,
            alpha: 1,
        },
        accent: {
            type: "hsla",
            hue: 210,
            saturation: 50,
            lightness: 60,
            alpha: 1,
        },
        hover: {
            type: "hsla",
            hue: 210,
            saturation: 20,
            lightness: 70,
            alpha: 1,
        },
        active: {
            type: "hsla",
            hue: 210,
            saturation: 30,
            lightness: 50,
            alpha: 1,
        },
        background: {
            soft: {
                type: "hsla",
                hue: 200,
                saturation: 20,
                lightness: 90,
                alpha: 1,
            },
            hard: {
                type: "hsla",
                hue: 210,
                saturation: 20,
                lightness: 30,
                alpha: 1,
            },
        },
        text: {
            soft: {
                type: "hsla",
                hue: 210,
                saturation: 5,
                lightness: 85,
                alpha: 1,
            },
            hard: {
                type: "hsla",
                hue: 210,
                saturation: 5,
                lightness: 20,
                alpha: 1,
            },
            inverse: {
                type: "hsla",
                hue: 0,
                saturation: 0,
                lightness: 100,
                alpha: 1,
            },
        },
        tags: {
            text: {
                type: "hsla",
                hue: 210,
                saturation: 50,
                lightness: 70,
                alpha: 1,
            },
            bg: {
                type: "hsla",
                hue: 200,
                saturation: 10,
                lightness: 80,
                alpha: 1,
            },
        },
        state: {
            error: {
                text: {
                    type: "hsla",
                    hue: 0,
                    saturation: 90,
                    lightness: 60,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 0,
                    saturation: 50,
                    lightness: 90,
                    alpha: 1,
                },
            },
            online: {
                text: {
                    type: "hsla",
                    hue: 120,
                    saturation: 60,
                    lightness: 50,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 120,
                    saturation: 50,
                    lightness: 70,
                    alpha: 1,
                },
            },
            loading: {
                text: {
                    type: "hsla",
                    hue: 60,
                    saturation: 80,
                    lightness: 50,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 60,
                    saturation: 60,
                    lightness: 80,
                    alpha: 1,
                },
            },
        },
        action: {
            playing: {
                text: {
                    type: "hsla",
                    hue: 210,
                    saturation: 60,
                    lightness: 50,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 210,
                    saturation: 60,
                    lightness: 70,
                    alpha: 1,
                },
            },
            paused: {
                text: {
                    type: "hsla",
                    hue: 30,
                    saturation: 60,
                    lightness: 40,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 30,
                    saturation: 60,
                    lightness: 60,
                    alpha: 1,
                },
            },
            retry: {
                text: {
                    type: "hsla",
                    hue: 0,
                    saturation: 80,
                    lightness: 40,
                    alpha: 1,
                },
                bg: {
                    type: "hsla",
                    hue: 0,
                    saturation: 80,
                    lightness: 70,
                    alpha: 1,
                },
            },
        },
    },
    typography: {
        primaryFont: "Helvetica, Arial, sans-serif",
        secondaryFont: "Roboto, sans-serif",
    },
    borderRadius: {
        input: "5px",
        general: "8px",
    },
    cardBoxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
};
