export type SunPalette = {
	lowHeat: string;
	highHeat: string;
};

export type SunTheme = "light" | "dark";

export type SunPaletteVariant =
	| "lightColor"
	| "lightMonochrome"
	| "darkColor"
	| "darkMonochrome";

export type SunPalettes = Record<SunPaletteVariant, SunPalette>;

const DARK_GRAY_SUN_PALETTE: SunPalette = {
	lowHeat: "#8c8c8c",
	highHeat: "#4d4d4d",
};

export const DEFAULT_SUN_PALETTES: SunPalettes = {
	lightColor: { lowHeat: "#d99228", highHeat: "#a64d1a" },
	lightMonochrome: { lowHeat: "#808080", highHeat: "#3f3f3f" },
	darkColor: { ...DARK_GRAY_SUN_PALETTE },
	darkMonochrome: { ...DARK_GRAY_SUN_PALETTE },
};

export type SunTrailColors = Record<SunPaletteVariant, string>;

export const DEFAULT_SUN_TRAIL_COLORS: SunTrailColors = {
	lightColor: "#b36a17",
	lightMonochrome: "#737373",
	darkColor: "#e6e6e6",
	darkMonochrome: "#e6e6e6",
};

function variantFor(theme: SunTheme, colorEnabled: boolean): SunPaletteVariant {
	if (theme === "light") {
		return colorEnabled ? "lightColor" : "lightMonochrome";
	}

	return colorEnabled ? "darkColor" : "darkMonochrome";
}

export function selectSunPalette(
	palettes: SunPalettes,
	theme: SunTheme,
	colorEnabled: boolean,
): SunPalette {
	return palettes[variantFor(theme, colorEnabled)];
}

export function selectSunTrailColor(
	colors: SunTrailColors,
	theme: SunTheme,
	colorEnabled: boolean,
): string {
	return colors[variantFor(theme, colorEnabled)];
}

type Rgb = readonly [number, number, number];

function parseHexColor(value: string): Rgb {
	const hex = value.replace("#", "");
	const expanded =
		hex.length === 3 ? hex.replace(/./g, (char) => char + char) : hex;

	if (!/^[\da-f]{6}$/i.test(expanded)) {
		return [0, 0, 0];
	}

	const parsed = Number.parseInt(expanded, 16);
	return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

export type SunInk = (heat: number) => string;

export function createSunInk(palette: SunPalette): SunInk {
	const lowHeatRgb = parseHexColor(palette.lowHeat);
	const highHeatRgb = parseHexColor(palette.highHeat);

	return (heat: number) => {
		const amount = Math.max(0, Math.min(1, heat));
		const channel = (index: number) =>
			Math.round(
				lowHeatRgb[index] + (highHeatRgb[index] - lowHeatRgb[index]) * amount,
			);

		return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
	};
}
