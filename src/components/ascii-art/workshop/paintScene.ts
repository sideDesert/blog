import {
	ditherCanvas,
	type DitherPaint,
	workshopHeight,
	workshopWidth,
} from "./ditherCanvas";
import type { CanvasLayer, MotionRegion } from "./sceneLayer";

type Paint = {
	daylight: boolean;
	dither?: DitherPaint;
};

function paintLayer(
	ctx: CanvasRenderingContext2D,
	layer: CanvasLayer,
	paint: Paint,
	amount?: number,
) {
	ctx.save();
	if (paint.daylight && layer.daylight)
		layer.daylight(ctx, Boolean(paint.dither), amount);
	else layer.draw(ctx, amount);
	ctx.restore();
}

function makeCanvas(width: number, height: number) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

export function paintWorkshop(
	ctx: CanvasRenderingContext2D,
	layers: readonly CanvasLayer[],
	paint: Paint,
) {
	const source =
		paint.dither && ctx.canvas.width > workshopWidth
			? makeCanvas(workshopWidth, workshopHeight).getContext("2d", {
					willReadFrequently: true,
				})
			: ctx;
	if (!source) return;
	source.clearRect(0, 0, workshopWidth, workshopHeight);
	for (const layer of layers) paintLayer(source, layer, paint);
	if (paint.dither) ditherCanvas(ctx, source, paint.dither);
}

// Bake the static layers between moving layers so animation keeps the original paint order.
export function createPatch(
	target: CanvasRenderingContext2D,
	layers: readonly CanvasLayer[],
	region: MotionRegion,
	paint: Paint,
) {
	const padding = 3;
	const { x, y, width, height } = region;
	const origin = { x: x - padding, y: y - padding };
	const patchWidth = width + 2 * padding;
	const patchHeight = height + 2 * padding;
	const canvas = makeCanvas(patchWidth, patchHeight);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return;
	const rasterScale = target.canvas.width / workshopWidth;
	const output =
		paint.dither && rasterScale > 1
			? makeCanvas(
					patchWidth * rasterScale,
					patchHeight * rasterScale,
				).getContext("2d")
			: ctx;
	if (!output) return;
	if (output !== ctx) output.scale(rasterScale, rasterScale);

	const passes: (HTMLCanvasElement | CanvasLayer)[] = [];
	let backdrop: CanvasRenderingContext2D | undefined;

	for (const layer of layers) {
		if (layer.motion?.includes(region)) {
			passes.push(layer);
			backdrop = undefined;
		} else {
			if (!backdrop) {
				const buffer = makeCanvas(patchWidth, patchHeight);
				const bufferContext = buffer.getContext("2d");
				if (!bufferContext) return;
				bufferContext.translate(-origin.x, -origin.y);
				passes.push(buffer);
				backdrop = bufferContext;
			}
			paintLayer(backdrop, layer, paint);
		}
	}

	return (amountFor: (layer: CanvasLayer) => number) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const pass of passes) {
			if (pass instanceof HTMLCanvasElement) {
				ctx.drawImage(pass, 0, 0);
			} else {
				ctx.save();
				ctx.translate(-origin.x, -origin.y);
				paintLayer(ctx, pass, paint, amountFor(pass));
				ctx.restore();
			}
		}
		if (paint.dither) ditherCanvas(output, ctx, paint.dither, origin);
		const outputScale = output.canvas.width / patchWidth;
		target.clearRect(x, y, width, height);
		target.drawImage(
			output.canvas,
			padding * outputScale,
			padding * outputScale,
			width * outputScale,
			height * outputScale,
			x,
			y,
			width,
			height,
		);
	};
}
