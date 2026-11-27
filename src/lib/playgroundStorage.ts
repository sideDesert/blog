import { DEFAULT_CIRCLES, type SunCircles } from "#/components/ascii-art/Sun";
import {
	DEFAULT_SUN_PALETTES,
	type SunPalettes,
	type SunPaletteVariant,
} from "#/components/ascii-art/sun/palette";
import {
	parseTerrainConfig,
	type TerrainConfig,
} from "#/components/ascii-art/terrain/model";
import type { AudioSettings } from "#/lib/hooks/useDesertAudio";

const KEYS = {
	terrain: "playground.terrain",
	sunPalettes: "playground.sunPalettes",
	sunCircles: "playground.sunCircles",
	showSunBounds: "playground.showSunBounds",
	audio: "playground.audio",
} as const;

const SUN_PALETTE_VARIANTS = Object.keys(
	DEFAULT_SUN_PALETTES,
) as SunPaletteVariant[];
const HEX_COLOR = /^#?(?:[\da-f]{3}|[\da-f]{6})$/i;

function readJson(key: string): unknown {
	if (typeof window === "undefined") return null;

	try {
		const stored = window.localStorage.getItem(key);
		return stored === null ? null : JSON.parse(stored);
	} catch {
		return null;
	}
}

function writeJson(key: string, value: unknown) {
	if (typeof window === "undefined") return;

	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		return;
	}
}

function readNumber(value: unknown, min: number, max: number): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return Math.max(min, Math.min(max, value));
}

function cloneCircles(): SunCircles {
	return {
		A: { ...DEFAULT_CIRCLES.A },
		B: { ...DEFAULT_CIRCLES.B },
		C: { ...DEFAULT_CIRCLES.C },
	};
}

function clonePalettes(): SunPalettes {
	return {
		lightColor: { ...DEFAULT_SUN_PALETTES.lightColor },
		lightMonochrome: { ...DEFAULT_SUN_PALETTES.lightMonochrome },
		darkColor: { ...DEFAULT_SUN_PALETTES.darkColor },
		darkMonochrome: { ...DEFAULT_SUN_PALETTES.darkMonochrome },
	};
}

export function readTerrainConfig(): TerrainConfig | null {
	const stored = readJson(KEYS.terrain);
	if (stored === null) return null;

	try {
		return parseTerrainConfig(stored);
	} catch {
		return null;
	}
}

export function writeTerrainConfig(config: TerrainConfig) {
	writeJson(KEYS.terrain, config);
}

export function readSunPalettes(): SunPalettes {
	const stored = readJson(KEYS.sunPalettes);
	if (!stored || typeof stored !== "object") return clonePalettes();

	const record = stored as Record<string, unknown>;
	const palettes = clonePalettes();

	for (const variant of SUN_PALETTE_VARIANTS) {
		const palette = record[variant];
		if (!palette || typeof palette !== "object") continue;

		const { lowHeat, highHeat } = palette as Record<string, unknown>;
		if (
			(variant === "lightColor" &&
				lowHeat === "#ffd166" &&
				highHeat === "#f08a24") ||
			(variant === "lightMonochrome" &&
				lowHeat === "#d9d9d9" &&
				highHeat === "#9b9b9b")
		) {
			continue;
		}
		if (typeof lowHeat === "string" && HEX_COLOR.test(lowHeat)) {
			palettes[variant].lowHeat = lowHeat;
		}
		if (typeof highHeat === "string" && HEX_COLOR.test(highHeat)) {
			palettes[variant].highHeat = highHeat;
		}
	}

	return palettes;
}

export function writeSunPalettes(palettes: SunPalettes) {
	writeJson(KEYS.sunPalettes, palettes);
}

export function readSunCircles(): SunCircles {
	const stored = readJson(KEYS.sunCircles);
	if (!stored || typeof stored !== "object") return cloneCircles();

	const record = stored as Record<string, unknown>;
	const circles = cloneCircles();

	for (const name of ["A", "B", "C"] as const) {
		const circle = record[name];
		if (!circle || typeof circle !== "object") continue;

		const values = circle as Record<string, unknown>;
		const x = readNumber(values.x, 0, 100);
		const y = readNumber(values.y, 0, 100);
		const r = readNumber(values.r, 5, 50);

		if (x !== null) circles[name].x = x;
		if (y !== null) circles[name].y = y;
		if (r !== null) circles[name].r = r;
	}

	return circles;
}

export function writeSunCircles(circles: SunCircles) {
	writeJson(KEYS.sunCircles, circles);
}

export function readShowSunBounds(): boolean {
	return readJson(KEYS.showSunBounds) === true;
}

export function writeShowSunBounds(show: boolean) {
	writeJson(KEYS.showSunBounds, show);
}

export function readAudioSettings(defaults: AudioSettings): AudioSettings {
	const stored = readJson(KEYS.audio);
	if (!stored || typeof stored !== "object") return { ...defaults };

	const record = stored as Record<string, unknown>;
	const settings = { ...defaults };

	for (const key of Object.keys(defaults) as (keyof AudioSettings)[]) {
		const value = readNumber(record[key], 0, 1);
		if (value !== null) settings[key] = value;
	}

	return settings;
}

export function writeAudioSettings(settings: AudioSettings) {
	writeJson(KEYS.audio, settings);
}
