import {
	desertDitherColumns,
	desertDotSize,
	ditherGlyphs,
	glyphSize,
	glyphSizeSteps,
	rowPitchRatio,
	sampleGlyphCell,
} from "../ditherGlyphs";
import { materialAt } from "./materialInk";

function pixelInk(data: ImageData["data"], offset: number) {
	const luminance =
		data[offset] * 0.21 + data[offset + 1] * 0.72 + data[offset + 2] * 0.07;
	return (data[offset + 3] / 255) * Math.max(0, luminance - 17);
}

function sampleInk(frame: ImageData, x: number, y: number) {
	const { data, width, height } = frame;
	const sampleX = Math.max(0, x - 0.5);
	const sampleY = Math.max(0, y - 0.5);
	const left = Math.floor(sampleX);
	const top = Math.floor(sampleY);
	const right = Math.min(left + 1, width - 1);
	const bottom = Math.min(top + 1, height - 1);
	const blendX = sampleX - left;
	const blendY = sampleY - top;
	const upper =
		pixelInk(data, (top * width + left) * 4) * (1 - blendX) +
		pixelInk(data, (top * width + right) * 4) * blendX;
	const lower =
		pixelInk(data, (bottom * width + left) * 4) * (1 - blendX) +
		pixelInk(data, (bottom * width + right) * 4) * blendX;
	return upper * (1 - blendY) + lower * blendY;
}

export type DitherStyle = "fine" | "soft";

export const workshopWidth = 1000;
export const workshopHeight = 500;

type DitherBounds = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

type DitherDetail = DitherBounds & {
	path: string;
	pitchScale?: number;
	style?: DitherStyle;
};

export type DitherPaint = {
	style: DitherStyle;
	daylight: boolean;
	palette?: ReturnType<typeof readDesertInks>;
	detail?: readonly DitherDetail[];
	paperFaces?: readonly string[];
};

export function readDesertInks(element: HTMLElement, dark: boolean) {
	const css = getComputedStyle(element);
	const read = (name: string) => {
		const hex = css.getPropertyValue(`--desert-${name}`).trim();
		return [1, 3, 5].map((offset) =>
			Number.parseInt(hex.slice(offset, offset + 2), 16),
		);
	};
	const sand = [
		"sand-shadow",
		"sand-deep",
		"sand-muted",
		"sand",
		"sand-rim",
		"sand-highlight",
	].map(read);
	const grass = read("grass");
	const materialShades = (name: string) => {
		const base = read(name);
		return Array.from({ length: 256 }, (_, ink) => {
			const gain = dark
				? Math.min(1.4, 0.52 + ink / 150)
				: Math.max(0.45, 0.78 - ink / 620);
			return `rgb(${base
				.map((channel) => Math.round(Math.min(255, channel * gain)))
				.join(" ")})`;
		});
	};
	return {
		wood: materialShades("wood"),
		fabric: materialShades("fabric"),
		metal: materialShades("metal"),
		paper: dark ? materialShades("paper") : Array<string>(256).fill("#111"),
		hemp: materialShades("hemp"),
		flame: materialShades("flame"),
		sand: Array.from({ length: 256 }, (_, ink) => {
			const level = dark ? Math.min(5, 1.2 + ink / 45) : 1;
			const left = Math.floor(level);
			const blend = level - left;
			const right = Math.min(left + 1, sand.length - 1);
			const channels = sand[left].map((channel, index) =>
				Math.round(channel + (sand[right][index] - channel) * blend),
			);
			return `rgb(${channels.join(" ")})`;
		}),
		grass: Array.from(
			{ length: 256 },
			(_, ink) =>
				`rgb(${grass.map((channel) => Math.round(channel * (0.66 + ink / 235))).join(" ")})`,
		),
	};
}

export function ditherCanvas(
	ctx: CanvasRenderingContext2D,
	source: CanvasRenderingContext2D,
	paint: DitherPaint,
	origin = { x: 0, y: 0 },
) {
	const { width, height } = source.canvas;
	const frame = source.getImageData(0, 0, width, height);
	ctx.clearRect(0, 0, width, height);
	if (paint.paperFaces?.length) {
		ctx.save();
		ctx.translate(-origin.x, -origin.y);
		ctx.fillStyle = "#fcfbf7";
		for (const face of paint.paperFaces) ctx.fill(new Path2D(face));
		ctx.restore();
	}
	ctx.fillStyle = paint.daylight ? "#000" : "#efe9da";

	const bounds = {
		left: origin.x,
		top: origin.y,
		right: origin.x + width,
		bottom: origin.y + height,
	};
	const pitch = workshopWidth / desertDitherColumns;
	const details = paint.detail?.filter(
		(detail) =>
			detail.right > bounds.left &&
			detail.bottom > bounds.top &&
			detail.left < bounds.right &&
			detail.top < bounds.bottom,
	);
	if (!details?.length) {
		drawMarks(ctx, frame, paint, origin, bounds, pitch);
		return;
	}

	const transform = new DOMMatrix().translate(-origin.x, -origin.y);
	const outsideDetail = new Path2D();
	const detailPaths = details.map((detail) => {
		const path = new Path2D();
		path.addPath(new Path2D(detail.path), transform);
		outsideDetail.addPath(path);
		return { detail, path };
	});
	outsideDetail.rect(0, 0, width, height);
	ctx.save();
	ctx.clip(outsideDetail, "evenodd");
	drawMarks(ctx, frame, paint, origin, bounds, pitch);
	ctx.restore();

	for (const { detail, path } of detailPaths) {
		const detailBounds = {
			left: Math.max(bounds.left, detail.left - 1),
			top: Math.max(bounds.top, detail.top - 1),
			right: Math.min(bounds.right, detail.right + 1),
			bottom: Math.min(bounds.bottom, detail.bottom + 1),
		};
		ctx.save();
		ctx.clip(path, "evenodd");
		drawMarks(
			ctx,
			frame,
			detail.style ? { ...paint, style: detail.style } : paint,
			origin,
			detailBounds,
			pitch * (detail.pitchScale ?? 0.78),
		);
		ctx.restore();
	}
}

function drawMarks(
	ctx: CanvasRenderingContext2D,
	frame: ImageData,
	{ style, daylight, palette }: DitherPaint,
	origin: { x: number; y: number },
	bounds: DitherBounds,
	columnPitch: number,
) {
	const { width } = frame;
	const softHighlights = !daylight && style === "soft";
	const snapToPixels = daylight && !palette;
	const scale = ctx.getTransform().a;
	const rowPitch = columnPitch * rowPitchRatio;
	const firstColumn = Math.max(0, Math.floor(bounds.left / columnPitch));
	const firstRow = Math.max(0, Math.floor(bounds.top / rowPitch));
	const lastColumn = bounds.right / columnPitch - 0.5;
	const lastRow = bounds.bottom / rowPitch - 0.5;

	for (let column = firstColumn; column < lastColumn; column++) {
		for (let row = firstRow; row < lastRow; row++) {
			const x = (column + 0.5) * columnPitch - origin.x;
			const y = (row + 0.5) * rowPitch - origin.y;
			const ink = sampleInk(frame, x, y);
			if (!ink) continue;
			const cell = sampleGlyphCell(column, row);
			const intensity = Math.min(1, ink / (daylight ? 72 : 140));
			const size = glyphSize(intensity, cell.rank) / glyphSizeSteps;
			if (!size) continue;
			if (palette) {
				const offset =
					(Math.max(0, Math.floor(y)) * width + Math.max(0, Math.floor(x))) * 4;
				const material = materialAt(
					frame.data[offset],
					frame.data[offset + 1],
					frame.data[offset + 2],
				);
				ctx.fillStyle = palette[material][Math.round(ink)];
			}
			const highlight = Math.min(1, Math.max(0, (ink - 18) / 88));
			const footprint = size * (daylight ? 1 : 1 + 0.52 * highlight);
			const aspect = daylight ? 1 : 0.83;
			const markWidth = columnPitch * desertDotSize * aspect * footprint;
			const markHeight = Math.min(
				rowPitch * 0.98,
				((columnPitch * desertDotSize) / aspect) * footprint,
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
			const alpha = daylight
				? 1
				: Math.min(1, (72 + ink * (1.35 + 0.3 * highlight)) / 255);
			ctx.globalAlpha = alpha * (1 - softness);
			for (const [left, top, spanX, spanY] of ditherGlyphs[cell.glyph]) {
				const x = centerX + (left - 0.5) * markWidth;
				const y = centerY + (top - 0.5) * markHeight;
				const width = spanX * markWidth;
				const height = spanY * markHeight;
				if (snapToPixels) {
					const leftPixel = Math.round(x * scale);
					const topPixel = Math.round(y * scale);
					ctx.fillRect(
						leftPixel / scale,
						topPixel / scale,
						(Math.round((x + width) * scale) - leftPixel) / scale,
						(Math.round((y + height) * scale) - topPixel) / scale,
					);
				} else {
					ctx.fillRect(x, y, width, height);
				}
			}
		}
	}
	ctx.globalAlpha = 1;
}
