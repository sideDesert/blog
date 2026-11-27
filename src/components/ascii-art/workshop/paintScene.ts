import {
	ditherCanvas,
	type DitherPaint,
	workshopHeight,
	workshopWidth,
} from "./ditherCanvas";
import { towerSignalLayers } from "./RadioTower";
import type { WorkshopLayer, WorkshopSceneName } from "./scenes";
import { awningFabricLayers } from "./Shop";

export type SceneLayer = {
	id: WorkshopLayer;
	draw: (ctx: CanvasRenderingContext2D, amount?: number) => void;
};

type Bounds = { x: number; y: number; width: number; height: number };
type Patch = { bounds: Bounds; moving: readonly WorkshopLayer[] };
type Paint = DitherPaint | undefined;

export const beaconPatch: Patch = {
	bounds: { x: 648, y: 216, width: 76, height: 54 },
	moving: towerSignalLayers,
};

export const lampLayers = [
	"light-spill",
	"lamplight",
	"lamp-rim",
	"lamp",
] as const;
// The lamp spill overlaps the right tuft.
const yuccaAndLampLayers = ["forecourt-yucca", ...lampLayers] as const;

export const lampPatch: Patch = {
	bounds: { x: 304, y: 333, width: 372, height: 123 },
	moving: [...yuccaAndLampLayers, ...awningFabricLayers],
};

export const motionPatches = {
	projects: [
		{
			bounds: { x: 551, y: 320, width: 98, height: 51 },
			moving: awningFabricLayers,
		},
		{
			bounds: { x: 124, y: 409, width: 104, height: 57 },
			moving: ["west-yucca"],
		},
		{
			bounds: { x: 625, y: 425, width: 87, height: 50 },
			moving: yuccaAndLampLayers,
		},
		{
			bounds: { x: 673, y: 380, width: 63, height: 40 },
			moving: ["awning-yucca"],
		},
	],
	blog: [
		{
			bounds: { x: 130, y: 339, width: 112, height: 67 },
			moving: ["valley-yucca", "cactus-yucca"],
		},
		{
			bounds: { x: 208, y: 423, width: 261, height: 63 },
			moving: ["west-boulder-yucca", "ledge-yucca"],
		},
		{
			bounds: { x: 823, y: 357, width: 48, height: 44 },
			moving: ["page-corner"],
		},
	],
	about: [
		{
			bounds: { x: 439, y: 319, width: 277, height: 118 },
			moving: [
				"tent-firelight",
				"firelight",
				"outer-flame",
				"inner-flame",
				"embers",
			],
		},
	],
} satisfies Record<WorkshopSceneName, Patch[]>;

function paintLayer(
	ctx: CanvasRenderingContext2D,
	layer: SceneLayer,
	amount?: number,
) {
	ctx.save();
	layer.draw(ctx, amount);
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
	layers: SceneLayer[],
	paint: Paint,
) {
	const source =
		paint && ctx.canvas.width > workshopWidth
			? makeCanvas(workshopWidth, workshopHeight).getContext("2d", {
					willReadFrequently: true,
				})
			: ctx;
	if (!source) return;
	source.clearRect(0, 0, workshopWidth, workshopHeight);
	for (const layer of layers) paintLayer(source, layer);
	if (paint) ditherCanvas(ctx, source, paint);
}

// Bake the static layers between moving layers so animation keeps the original paint order.
export function createPatch(
	target: CanvasRenderingContext2D,
	layers: SceneLayer[],
	{ bounds, moving }: Patch,
	paint: Paint,
) {
	if (!layers.some((layer) => moving.includes(layer.id))) return;

	const padding = 3;
	const { x, y, width, height } = bounds;
	const origin = { x: x - padding, y: y - padding };
	const patchWidth = width + 2 * padding;
	const patchHeight = height + 2 * padding;
	const canvas = makeCanvas(patchWidth, patchHeight);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return;
	const rasterScale = target.canvas.width / workshopWidth;
	const output =
		paint && rasterScale > 1
			? makeCanvas(
					patchWidth * rasterScale,
					patchHeight * rasterScale,
				).getContext("2d")
			: ctx;
	if (!output) return;
	if (output !== ctx) output.scale(rasterScale, rasterScale);

	const passes: (HTMLCanvasElement | SceneLayer)[] = [];
	let backdrop: CanvasRenderingContext2D | undefined;

	for (const layer of layers) {
		if (moving.includes(layer.id)) {
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
			paintLayer(backdrop, layer);
		}
	}

	return (amountFor: (layer: WorkshopLayer) => number) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const pass of passes) {
			if (pass instanceof HTMLCanvasElement) {
				ctx.drawImage(pass, 0, 0);
			} else {
				ctx.save();
				ctx.translate(-origin.x, -origin.y);
				paintLayer(ctx, pass, amountFor(pass.id));
				ctx.restore();
			}
		}
		if (paint) ditherCanvas(output, ctx, paint, origin);
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
