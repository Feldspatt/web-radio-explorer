type HSLAColor = {
	type: "hsla";
	hue: number;
	saturation: number;
	lightness: number;
	alpha: number;
};

type GradientColor = {
	type: "linear-gradient";
	angle: number;
	colors: Array<{
		color: string;
		position?: number;
	}>;
};

type ColorValue = HSLAColor | GradientColor;

type ColorPair = {
	text: ColorValue;
	bg: ColorValue;
	border?: ColorValue;
};

type Theme = {
	name: string;
	symbol: string;
	colors: {
		strong: ColorValue;
		accent: ColorValue;
		hover: ColorValue;
		active: ColorValue;
		background: {
			soft: ColorValue;
			hard: ColorValue;
		};
		text: {
			soft: ColorValue;
			hard: ColorValue;
			inverse: ColorValue;
		};
		tags: ColorPair;
		state: {
			error: ColorPair;
			online: ColorPair;
			loading: ColorPair;
		};
		action: {
			playing: ColorPair;
			paused: ColorPair;
			retry: ColorPair;
		};
	};
	typography: {
		primaryFont: string;
		secondaryFont: string;
	};
	borderRadius: {
		input: string;
		general: string;
	};
	cardBoxShadow: string;
};
