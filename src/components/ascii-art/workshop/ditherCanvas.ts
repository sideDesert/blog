import {
	ditherGlyphs,
	glyphSize,
	glyphSizeSteps,
	rowPitchRatio,
	sampleGlyphCell,
} from "../ditherGlyphs";

function sampleInk(frame: ImageData, x: number, y: number) {
	const { data, width } = frame;
	const offset = (Math.floor(y) * width + Math.floor(x)) * 4;
	const luminance =
		data[offset] * 0.21 + data[offset + 1] * 0.72 + data[offset + 2] * 0.07;
	return (data[offset + 3] / 255) * Math.max(0, luminance - 17);
}

export type DitherStyle = "fine" | "soft";

export function ditherCanvas(
	ctx: CanvasRenderingContext2D,
	style: DitherStyle,
) {
	const { width, height } = ctx.canvas;
	const frame = ctx.getImageData(0, 0, width, height);
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "#efe9da";

	const columnPitch = width / 740;
	const softHighlights = style === "soft";
	const rowPitch = columnPitch * rowPitchRatio;
	for (let column = 0; (column + 0.5) * columnPitch < width; column++) {
		for (let row = 0; (row + 0.5) * rowPitch < height; row++) {
			const x = (column + 0.5) * columnPitch;
			const y = (row + 0.5) * rowPitch;
			const ink = sampleInk(frame, x, y);
			if (!ink) continue;
			const cell = sampleGlyphCell(column, row);
			const intensity = Math.min(1, ink / 140);
			const size = glyphSize(intensity, cell.rank) / glyphSizeSteps;
			if (!size) continue;
			const highlight = Math.min(1, Math.max(0, (ink - 18) / 88));
			const footprint = size * (1 + 0.52 * highlight);
			const markWidth = columnPitch * 0.76 * 0.83 * footprint;
			const markHeight = Math.min(
				rowPitch * 0.98,
				((columnPitch * 0.76) / 0.83) * footprint,
			);
			const centerX = x + cell.scatterX * columnPitch;
			const centerY = y + cell.scatterY * rowPitch;

			const softness = softHighlights
				? Math.min(0.36, Math.max(0, (ink - 52) / 190))
				: 0;
			if (softness > 0) {
				ctx.globalAlpha = softness * 0.52;
				ctx.fillRect(
					x - columnPitch / 2,
					y - rowPitch / 2,
					columnPitch,
					rowPitch,
				);
			}
			const alpha = Math.min(1, (72 + ink * (1.35 + 0.3 * highlight)) / 255);
			ctx.globalAlpha = alpha * (1 - softness);
			for (const [left, top, spanX, spanY] of ditherGlyphs[cell.glyph]) {
				ctx.fillRect(
					centerX + (left - 0.5) * markWidth,
					centerY + (top - 0.5) * markHeight,
					spanX * markWidth,
					spanY * markHeight,
				);
			}
		}
	}
	ctx.globalAlpha = 1;
}
