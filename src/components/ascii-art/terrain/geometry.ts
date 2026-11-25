import type {
	Irregularities,
	RenderSettings,
	Shape,
	TerrainConfig,
} from "./model";
import { baseVerticalScale } from "./model";
import { createDotPaths, type SurfaceSeam, terrainFrame } from "./shading";

export const samples = Array.from({ length: 1001 }, (_, index) => index / 10);

export type SeamEntry = {
	id: string;
	name: string;
	seam: SurfaceSeam;
};

export type TerrainScene = {
	ridgeAt: (x: number) => number;
	silhouette: string;
	basePoints: string;
	seams: SeamEntry[];
	dotPaths: ReturnType<typeof createDotPaths> | null;
};

export function evaluateShape(x: number, shape: Shape): number {
	const left = x < shape.center;
	const width = left ? shape.leftWidth : shape.rightWidth;
	const power = left ? shape.leftPower : shape.rightPower;
	const distance = Math.max(0, Math.abs(x - shape.center) - shape.plateau / 2);
	const t = Math.max(0, 1 - distance / width);

	return shape.height * t ** power;
}

function evaluateTerrain(x: number, shapes: Shape[]) {
	let height = 0;

	for (const shape of shapes) {
		const value = evaluateShape(x, shape);

		switch (shape.operation) {
			case "max":
				height = Math.max(height, value);
				break;
			case "add":
				height += value;
				break;
			case "subtract":
				height -= value;
				break;
		}
	}

	return Math.max(0, height);
}

function applyIrregularities(x: number, base: number, noise: Irregularities) {
	const large =
		noise.largeAmplitude *
		(Math.sin(x * noise.largeFrequency) +
			0.5 * Math.sin(x * noise.largeFrequency * 2.2));
	const small =
		noise.smallAmplitude *
		(Math.sin(x * noise.smallFrequency) +
			0.4 * Math.sin(x * noise.smallFrequency * 1.6));
	const mask = Math.min(1, base / 5);

	return Math.max(0, base + mask * (large + small));
}

function seamEntries(shapes: Shape[]): SeamEntry[] {
	return shapes.flatMap((shape) => {
		if (!shape.seam || shape.height === 0) return [];

		const { toeOffset, extent, strength } = shape.seam;
		const slopeWidth = toeOffset < 0 ? shape.leftWidth : shape.rightWidth;
		const anchor = Math.min(100, shape.center + shape.plateau * 0.27);
		const toe = Math.max(0, Math.min(100, anchor + toeOffset * slopeWidth));

		return [
			{
				id: shape.id,
				name: shape.name,
				seam: {
					anchor: anchor / 100,
					toe: toe / 100,
					width: Math.min(0.024, Math.max(0.007, slopeWidth * 0.0025)),
					extent,
					strength,
				},
			},
		];
	});
}

export function createScene(
	config: TerrainConfig,
	render: RenderSettings,
): TerrainScene {
	const terrain = (x: number) =>
		applyIrregularities(x, evaluateTerrain(x, config.shapes), config.noise);
	const toY = (height: number) =>
		terrainFrame.bottom - height * config.verticalScale;
	const ridgeAt = (x: number) => toY(terrain(x));
	const points = samples.map((x) => `${x},${ridgeAt(x)}`).join(" ");
	const silhouette = `0,${terrainFrame.bottom} ${points} ${terrainFrame.width},${terrainFrame.bottom}`;
	const basePoints = samples
		.map((x) => `${x},${toY(evaluateTerrain(x, config.shapes))}`)
		.join(" ");
	const seams = seamEntries(config.shapes);
	const dotPaths = render.dither
		? createDotPaths(
				ridgeAt,
				config.depthBlocks,
				seams.map(({ seam }) => seam),
				config.drawnSeams,
				config.verticalScale / baseVerticalScale,
				render.gridSize,
				render.dotSize,
			)
		: null;

	return { ridgeAt, silhouette, basePoints, seams, dotPaths };
}
