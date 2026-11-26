const bayerThresholds = [
	[0, 48, 12, 60, 3, 51, 15, 63],
	[32, 16, 44, 28, 35, 19, 47, 31],
	[8, 56, 4, 52, 11, 59, 7, 55],
	[40, 24, 36, 20, 43, 27, 39, 23],
	[2, 50, 14, 62, 1, 49, 13, 61],
	[34, 18, 46, 30, 33, 17, 45, 29],
	[10, 58, 6, 54, 9, 57, 5, 53],
	[42, 26, 38, 22, 41, 25, 37, 21],
];

export const ditherGlyphs = [
	[[0.02, 0.05, 0.95, 0.93]],
	[[0.08, 0.02, 0.86, 0.97]],
	[[0.05, 0.04, 0.89, 0.94]],
	[[0.02, 0.08, 0.96, 0.83]],
	[[0.1, 0.02, 0.78, 0.96]],
	[
		[0.12, 0, 0.72, 0.39],
		[0.17, 0.52, 0.66, 0.47],
	],
	[
		[0.03, 0.11, 0.4, 0.83],
		[0.43, 0.24, 0.55, 0.65],
	],
	[[0.05, 0.04, 0.91, 0.93]],
];

export const glyphSizeSteps = 16;
export const rowPitchRatio = 1.33;
export function glyphSize(coverage: number, rank: number) {
	const chance = Math.sqrt(coverage);
	return chance > (rank + 0.5) / 64
		? Math.max(1, Math.round(Math.sqrt(chance) * glyphSizeSteps))
		: 0;
}

export function sampleGlyphCell(column: number, row: number) {
	const cell = Math.imul(column, 0x1f123bb5) ^ Math.imul(row, 0x5f356495);
	const variation = Math.imul(cell ^ (cell >>> 16), 0x45d9f3b) >>> 0;
	const jitter = ((variation >>> 24) & 15) - 8;
	return {
		rank: (bayerThresholds[row % 8][column % 8] + jitter + 64) % 64,
		glyph: variation & 7,
		scatterX: 0.24 * (((variation >>> 3) & 255) / 255 - 0.5),
		scatterY: 0.23 * (((variation >>> 11) & 255) / 255 - 0.5),
		toneThreshold: ((variation >>> 17) & 255) / 255,
	};
}
