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
export type AudioSettings = {
	wind: number;
	sand: number;
	gusts: number;
	volume: number;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
	wind: 0.65,
	sand: 0.2,
	gusts: 0.35,
	volume: 0.03,
};

const VERSION = 1;
const SAVE_KEY = "studio.save";

type StudioFields = {
	terrain?: TerrainConfig;
	palettes?: SunPalettes;
	circles?: SunCircles;
	showBounds?: boolean;
	audio?: AudioSettings;
};

export type StudioSave = StudioFields & { version: typeof VERSION };

const LEGACY_KEYS = {
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

function decodeTerrain(value: unknown): TerrainConfig | undefined {
	try {
		return parseTerrainConfig(value) ?? undefined;
	} catch {
		return undefined;
	}
}

function decodePalettes(stored: unknown, legacy: boolean): SunPalettes {
	if (!stored || typeof stored !== "object") return clonePalettes();

	const record = stored as Record<string, unknown>;
	const palettes = clonePalettes();

	for (const variant of SUN_PALETTE_VARIANTS) {
		const palette = record[variant];
		if (!palette || typeof palette !== "object") continue;

		const { lowHeat, highHeat } = palette as Record<string, unknown>;
		if (
			legacy &&
			((variant === "lightColor" &&
				lowHeat === "#ffd166" &&
				highHeat === "#f08a24") ||
				(variant === "lightMonochrome" &&
					lowHeat === "#d9d9d9" &&
					highHeat === "#9b9b9b"))
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

function decodeCircles(stored: unknown): SunCircles {
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

function decodeAudio(stored: unknown): AudioSettings {
	const defaults = DEFAULT_AUDIO_SETTINGS;
	if (!stored || typeof stored !== "object") return { ...defaults };

	const record = stored as Record<string, unknown>;
	const settings = { ...defaults };

	for (const key of Object.keys(defaults) as (keyof AudioSettings)[]) {
		const value = readNumber(record[key], 0, 1);
		if (value !== null) settings[key] = value;
	}

	return settings;
}

function record(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}

function decodeStudio(
	fields: Record<string, unknown>,
	legacy = false,
): StudioSave {
	return {
		version: VERSION,
		terrain: decodeTerrain(fields.terrain),
		palettes: record(fields.palettes)
			? decodePalettes(fields.palettes, legacy)
			: undefined,
		circles: record(fields.circles) ? decodeCircles(fields.circles) : undefined,
		showBounds:
			typeof fields.showBounds === "boolean" ? fields.showBounds : undefined,
		audio: record(fields.audio) ? decodeAudio(fields.audio) : undefined,
	};
}

function readStoredStudio() {
	try {
		const raw = window.localStorage.getItem(SAVE_KEY);
		if (raw !== null) {
			const fields = record(JSON.parse(raw));
			if (fields?.version === VERSION)
				return { save: decodeStudio(fields), writable: true };
			return {
				save: { version: VERSION } satisfies StudioSave,
				writable: false,
			};
		}

		const save = decodeStudio(
			{
				terrain: readJson(LEGACY_KEYS.terrain),
				palettes: readJson(LEGACY_KEYS.sunPalettes),
				circles: readJson(LEGACY_KEYS.sunCircles),
				showBounds: readJson(LEGACY_KEYS.showSunBounds),
				audio: readJson(LEGACY_KEYS.audio),
			},
			true,
		);
		return { save, writable: true, legacy: true };
	} catch {
		return { save: { version: VERSION } satisfies StudioSave, writable: false };
	}
}

export function readStudioSave({ migrate = false } = {}): StudioSave {
	const { save, legacy } = readStoredStudio();
	if (
		migrate &&
		legacy &&
		Object.entries(save).some(
			([key, value]) => key !== "version" && value !== undefined,
		)
	) {
		writeJson(SAVE_KEY, save);
	}
	return save;
}

export function updateStudioSave(patch: StudioFields) {
	const { save, writable } = readStoredStudio();
	if (writable) writeJson(SAVE_KEY, { ...save, ...patch });
}

export function exportStudioTerrain(terrain: TerrainConfig): string {
	return JSON.stringify(
		{ version: VERSION, terrain } satisfies StudioSave,
		null,
		2,
	);
}

export function importStudioTerrain(value: unknown): TerrainConfig | null {
	const fields = record(value);
	if (fields && "version" in fields) {
		return fields.version === VERSION
			? parseTerrainConfig(fields.terrain)
			: null;
	}
	return parseTerrainConfig(value);
}
