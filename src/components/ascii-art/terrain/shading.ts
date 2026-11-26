import {
	ditherGlyphs,
	glyphSize,
	glyphSizeSteps,
	rowPitchRatio,
	sampleGlyphCell,
} from "../ditherGlyphs";
export type DepthBlock = {
	name: string;
	center: number;
	leftWidth: number;
	rightWidth: number;
	crestDepth: number;
	footDepth: number;
	height: number;
};

export type SurfaceSeam = {
	anchor: number;
	toe: number;
	width: number;
	extent: number;
	strength: number;
};

export type SeamPoint = { x: number; y: number };

export type DrawnSeam = {
	points: SeamPoint[];
	side: 1 | -1;
};

export function isDrawnSeam(value: unknown): value is DrawnSeam {
	if (typeof value !== "object" || value === null) return false;

	const { points, side } = value as Partial<DrawnSeam>;
	return (
		(side === 1 || side === -1) &&
		Array.isArray(points) &&
		points.length >= 2 &&
		points.every(
			(point) =>
				point &&
				typeof point.x === "number" &&
				point.x >= 0 &&
				point.x <= 1 &&
				typeof point.y === "number" &&
				point.y >= 0 &&
				point.y <= 1,
		)
	);
}

export function isDepthBlock(value: unknown): value is DepthBlock {
	if (typeof value !== "object" || value === null) return false;

	const { name, center, leftWidth, rightWidth, crestDepth, footDepth, height } =
		value as Partial<DepthBlock>;
	return (
		typeof name === "string" &&
		typeof center === "number" &&
		center >= 0 &&
		center <= 1 &&
		typeof leftWidth === "number" &&
		leftWidth > 0 &&
		leftWidth <= 1 &&
		typeof rightWidth === "number" &&
		rightWidth > 0 &&
		rightWidth <= 1 &&
		typeof crestDepth === "number" &&
		crestDepth >= 0 &&
		crestDepth < 1 &&
		typeof footDepth === "number" &&
		footDepth > crestDepth &&
		footDepth <= 1 &&
		typeof height === "number" &&
		height > 0 &&
		height <= 1
	);
}

export const terrainFrame = {
	width: 100,
	top: -120,
	bottom: 100,
	height: 220,
	aspectRatio: 2190 / 526,
};

export function drawnSeamPoints(points: SeamPoint[]) {
	return points
		.map(
			({ x, y }) =>
				`${(x * terrainFrame.width).toFixed(4)},${(terrainFrame.top + y * terrainFrame.height).toFixed(4)}`,
		)
		.join(" ");
}

type RidgeColumn = {
	block: DepthBlock | null;
	crestDepth: number;
	depthRun: number;
	crestHeight: number;
	crestSlope: number;
	top: number;
	bottom: number;
};

type VisibleRidge = {
	ridge: RidgeColumn;
	depth: number;
	slopePosition: number;
};

type SeamSegment = {
	x: number;
	y: number;
	dx: number;
	dy: number;
	length: number;
	start: number;
	total: number;
	side: DrawnSeam["side"];
	surface: VisibleRidge;
};

const darkInkLevels = [0.12, 0.27, 0.45, 0.58, 0.72, 1];
const light = { x: 0.56, height: 0.4, depth: 0.45 };
const groundSlope = 0.45;
const skylineDepth = 0.63;
const skylineFoot = 0.85;
const pigmentBands = [
	{ x: 0.114, y: 0.279, width: 0.033, height: 0.1, ink: 0.32 },
	{ x: 0.043, y: 0.469, width: 0.048, height: 0.113, ink: -0.1 },
	{ x: 0.237, y: 0.449, width: 0.062, height: 0.12, ink: -0.12 },
	{ x: 0.374, y: 0.748, width: 0.041, height: 0.069, ink: -0.29 },
	{ x: 0.55, y: 0.715, width: 0.07, height: 0.08, ink: 0.2 },
	{ x: 0.869, y: 0.695, width: 0.055, height: 0.12, ink: -0.29 },
	{ x: 0.98, y: 0.732, width: 0.025, height: 0.08, ink: 0.13 },
];

function groundY(depth: number) {
	return 0.5 + groundSlope * depth;
}

function smoothstep(start: number, end: number, value: number) {
	const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
	return t * t * (3 - 2 * t);
}

function seamX(seam: SurfaceSeam, progress: number) {
	return seam.anchor + (seam.toe - seam.anchor) * smoothstep(0.22, 1, progress);
}

function skylineHeight(projectedY: number) {
	return Math.max(0, groundY(skylineDepth) - projectedY);
}

export function seamPoints(seam: SurfaceSeam, ridgeAt: (x: number) => number) {
	const frame = terrainFrame;
	return Array.from({ length: 65 }, (_, index) => {
		const progress = index / 64;
		const x = seamX(seam, progress) * frame.width;
		const slopePosition = seam.extent * progress;
		const crestHeight = skylineHeight((ridgeAt(x) - frame.top) / frame.height);
		const depth = skylineDepth + (skylineFoot - skylineDepth) * slopePosition;
		const height = crestHeight * (1 - slopePosition) ** 2;
		const y = frame.top + frame.height * (groundY(depth) - height);
		return `${x.toFixed(4)},${y.toFixed(4)}`;
	}).join(" ");
}

function seamShadow(x: number, slopePosition: number, seams: SurfaceSeam[]) {
	let shadow = 0;
	for (const seam of seams) {
		if (slopePosition >= seam.extent) continue;

		const progress = slopePosition / seam.extent;
		const across = (x - seamX(seam, progress)) / seam.width;
		const face =
			smoothstep(-0.04, 0.16, across) * (1 - smoothstep(0.26, 1, across));
		const fade = 1 - smoothstep(0.55, 1, progress);
		shadow = Math.max(shadow, seam.strength * face * fade);
	}
	return shadow;
}

function blockHeight(block: DepthBlock, x: number, scale: number) {
	const width = x < block.center ? block.leftWidth : block.rightWidth;
	const distance = Math.min(1, Math.abs(x - block.center) / width);
	return block.height * scale * (1 - distance * distance) ** 2;
}

function pigmentAt(x: number, y: number) {
	let ink = 0;
	for (const band of pigmentBands) {
		const across = (x - band.x) / band.width;
		const down = (y - band.y) / band.height;
		ink += band.ink * Math.exp(-(across * across + down * down));
	}
	return ink;
}

function ridgeColumn(
	crestDepth: number,
	footDepth: number,
	crestHeight: number,
	crestSlope: number,
	block: DepthBlock | null,
): RidgeColumn {
	return {
		block,
		crestDepth,
		depthRun: footDepth - crestDepth,
		crestHeight,
		crestSlope,
		top: groundY(crestDepth) - crestHeight,
		bottom: groundY(footDepth),
	};
}

function visibleRidgeAt(
	ridges: RidgeColumn[],
	y: number,
): VisibleRidge | undefined {
	let visible: VisibleRidge | undefined;

	for (const ridge of ridges) {
		if (y < ridge.top || y > ridge.bottom) continue;

		// Invert the projected quadratic slope to recover Z at this dot.
		const rise = y - ridge.top;
		const projectedRun = groundSlope * ridge.depthRun + 2 * ridge.crestHeight;
		const discriminant = Math.max(
			0,
			projectedRun ** 2 - 4 * ridge.crestHeight * rise,
		);
		const position = (2 * rise) / (projectedRun + Math.sqrt(discriminant));
		const depth = ridge.crestDepth + ridge.depthRun * position;

		if (!visible || depth > visible.depth) {
			visible = { ridge, depth, slopePosition: position };
		}
	}

	return visible;
}

function ridgeColumnsAt(
	x: number,
	ridgeAt: (x: number) => number,
	blocks: DepthBlock[],
	scale: number,
) {
	const frame = terrainFrame;
	const derivativeStep = 0.002;
	const drawX = x * frame.width;
	const silhouette = (ridgeAt(drawX) - frame.top) / frame.height;
	const skylineSlope =
		(ridgeAt(drawX - derivativeStep * frame.width) -
			ridgeAt(drawX + derivativeStep * frame.width)) /
		(2 * derivativeStep * frame.height);
	const ridges = [
		ridgeColumn(
			skylineDepth,
			skylineFoot,
			skylineHeight(silhouette),
			skylineSlope,
			null,
		),
	];

	for (const block of blocks) {
		const height = blockHeight(block, x, scale);
		if (height === 0) continue;

		const slope =
			(blockHeight(block, x + derivativeStep, scale) -
				blockHeight(block, x - derivativeStep, scale)) /
			(2 * derivativeStep);
		ridges.push(
			ridgeColumn(block.crestDepth, block.footDepth, height, slope, block),
		);
	}

	return { silhouette, ridges };
}

const drawnShadowWidth = 0.054;

function resolveDrawnSeams(
	drawings: DrawnSeam[],
	ridgeAt: (x: number) => number,
	blocks: DepthBlock[],
	scale: number,
) {
	const segments: SeamSegment[] = [];
	const aspect = terrainFrame.aspectRatio;
	for (const drawing of drawings) {
		const edges = drawing.points.slice(1).map((end, index) => {
			const start = drawing.points[index];
			const dx = (end.x - start.x) * aspect;
			const dy = end.y - start.y;
			return {
				x: start.x * aspect,
				y: start.y,
				dx,
				dy,
				length: Math.hypot(dx, dy),
			};
		});
		const total = edges.reduce((sum, edge) => sum + edge.length, 0);
		let start = 0;
		for (const edge of edges) {
			if (edge.length === 0) continue;
			const x = (edge.x + edge.dx / 2) / aspect;
			const { ridges, silhouette } = ridgeColumnsAt(x, ridgeAt, blocks, scale);
			const sampleY = Math.max(silhouette, edge.y + edge.dy / 2) + 0.0001;
			const surface = visibleRidgeAt(ridges, sampleY);
			if (surface)
				segments.push({ ...edge, start, total, side: drawing.side, surface });
			start += edge.length;
		}
	}
	return segments;
}

function drawnShadow(
	x: number,
	y: number,
	hit: VisibleRidge,
	segments: SeamSegment[],
) {
	let shadow = 0;
	for (const segment of segments) {
		if (
			hit.ridge.block !== segment.surface.ridge.block &&
			hit.depth > segment.surface.depth
		)
			continue;

		const dx = x * terrainFrame.aspectRatio - segment.x;
		const dy = y - segment.y;
		const t = (dx * segment.dx + dy * segment.dy) / segment.length ** 2;
		if (t < 0 || t > 1) continue;

		const distance =
			((dx * segment.dy - dy * segment.dx) / segment.length) * segment.side;
		if (distance <= 0 || distance >= drawnShadowWidth) continue;

		const progress = (segment.start + t * segment.length) / segment.total;
		const taper =
			smoothstep(0, 0.12, progress) * (1 - smoothstep(0.66, 1, progress));
		const spread = drawnShadowWidth * (0.3 + 0.7 * taper);
		const fade = 1 - smoothstep(spread * 0.2, spread, distance);
		shadow = Math.max(shadow, taper * fade);
	}
	return shadow;
}

function shadowOnSurface(
	x: number,
	depth: number,
	height: number,
	receiver: DepthBlock | null,
	blocks: DepthBlock[],
	scale: number,
) {
	let shadow = 0;

	for (const block of blocks) {
		if (block === receiver) continue;

		const entry = Math.max(
			0,
			(block.crestDepth - depth) / light.depth,
			(block.center - block.leftWidth - x) / light.x,
		);
		const exit = Math.min(
			(block.footDepth - depth) / light.depth,
			(block.center + block.rightWidth - x) / light.x,
		);
		if (
			entry >= exit ||
			block.height * scale <= height + light.height * entry
		) {
			continue;
		}

		const depthRun = block.footDepth - block.crestDepth;

		// Follow the ray across the whole face after it enters the dune's footprint.
		for (let sample = 0; sample <= 8; sample++) {
			const travel = entry + ((exit - entry) * sample) / 8;
			const rayDepth = depth + light.depth * travel;
			const remaining = (block.footDepth - rayDepth) / depthRun;
			const slopeHeight =
				blockHeight(block, x + light.x * travel, scale) * remaining ** 2;
			const clearance = slopeHeight - (height + light.height * travel);
			shadow = Math.max(
				shadow,
				smoothstep(0, 0.048 + travel * 0.14, clearance),
			);
		}
	}

	return shadow;
}

function terrainInk(
	x: number,
	y: number,
	ridges: RidgeColumn[],
	blocks: DepthBlock[],
	seams: SurfaceSeam[],
	drawnSegments: SeamSegment[],
	scale: number,
) {
	const sand = 0.042 * (1 - smoothstep(0.84, 0.98, y));
	const darkSand = 0.064 * (1 - smoothstep(0.86, 1.01, y));
	const hit = visibleRidgeAt(ridges, y);
	if (!hit) return { light: sand, dark: darkSand, darkTone: 0.72 };

	const { ridge: visible, depth: visibleDepth, slopePosition } = hit;
	const remaining = 1 - slopePosition;
	const surfaceHeight = visible.crestHeight * remaining ** 2;
	const slopeX = visible.crestSlope * remaining ** 2;
	const slopeZ = (-2 * visible.crestHeight * remaining) / visible.depthRun;
	const diffusion =
		(light.height - slopeX * light.x - slopeZ * light.depth) /
		Math.hypot(1, slopeX, slopeZ);

	const westernMesa = 1 - smoothstep(0.25, 0.36, x);
	const sandstoneFace = (x - (0.143 + 0.11 * (y - 0.27))) / 0.026;
	const paleFace = 0.34 * westernMesa * Math.exp(-(sandstoneFace ** 2));
	const tone = 0.28 + 0.62 * (1 - Math.max(0, diffusion)) - paleFace;
	const contrast = 0.73 + 0.27 * visibleDepth;
	const crest = 0.16 * (1 - smoothstep(0, 0.22, slopePosition));
	const fade = 1 - smoothstep(0.43, 1, slopePosition);
	const groundFade =
		1 - smoothstep(0.692 - 0.154 * westernMesa, 0.84 - 0.078 * westernMesa, y);
	const grain = 0.05 * Math.sin(x * 470 + visibleDepth * 83);
	const facing = fade * groundFade;
	const coverage = Math.max(
		0,
		Math.min(
			1,
			(tone * contrast + crest + grain + pigmentAt(x, y)) * facing + sand,
		),
	);
	const shadow =
		shadowOnSurface(
			x,
			visibleDepth,
			surfaceHeight,
			visible.block,
			blocks,
			scale,
		) * Math.sqrt(facing);
	const faceShadow = visible.block
		? 0
		: seamShadow(x, slopePosition, seams) * facing;
	const drawn = drawnShadow(x, y, hit, drawnSegments) * Math.sqrt(facing);

	const basinDistance = (x - 0.51) / 0.22;
	const eastButteDistance = (x - 0.8) / 0.055;
	const eastCliffDistance = (x - (0.907 + 0.06 * (y - 0.45))) / 0.025;
	const westShoulderDistance = (x - 0.035) / 0.07;
	const distantInk = 0.23 * Math.exp(-(basinDistance ** 2));
	const butteLight = 0.23 * Math.exp(-(eastButteDistance ** 2));
	const shoulderShade =
		0.14 *
		Math.exp(-(westShoulderDistance ** 2)) *
		(1 - smoothstep(0.41, 0.62, y));
	const cliffShade =
		0.08 * Math.exp(-(sandstoneFace ** 2)) +
		0.15 * Math.exp(-(eastCliffDistance ** 2));
	const rimLight = visible.block
		? 0
		: 0.32 * (1 - smoothstep(0.003, 0.024, y - visible.top));
	const fillLight = 0.63 + 0.25 * smoothstep(0.66, 0.82, y);
	const darkTone =
		(fillLight -
			distantInk +
			butteLight -
			shoulderShade -
			cliffShade +
			rimLight) *
		(1 - 0.83 * shadow) *
		(1 - 0.72 * faceShadow) *
		(1 - 0.88 * drawn);
	const darkCoverage = Math.min(
		1,
		coverage + 0.42 * paleFace * facing + darkSand - sand,
	);
	const lightCoverage = Math.min(
		1,
		coverage + 0.35 * Math.max(0, coverage - sand),
	);

	return {
		light:
			lightCoverage +
			(1 - lightCoverage) *
				Math.min(1, 0.58 * shadow + 0.3 * faceShadow + 0.64 * drawn),
		dark:
			darkCoverage *
			(1 - 0.34 * shadow) *
			(1 - 0.16 * faceShadow) *
			(1 - 0.24 * drawn),
		darkTone,
	};
}

function darkInkLevel(tone: number, threshold: number) {
	for (let index = 1; index < darkInkLevels.length; index++) {
		const low = darkInkLevels[index - 1];
		const high = darkInkLevels[index];
		if (tone <= high)
			return tone > low + (high - low) * threshold ? index : index - 1;
	}
	return darkInkLevels.length - 1;
}

type GlyphRect = { x: number; y: number; path: string };

function createStamps(width: number, height: number) {
	return Array.from({ length: glyphSizeSteps + 1 }, (_, index) => {
		const size = index / glyphSizeSteps;
		return ditherGlyphs.map((glyph) =>
			glyph.map(([left, top, spanX, spanY]) => {
				const rectWidth = (width * size * spanX).toFixed(4);
				const rectHeight = (height * size * spanY).toFixed(4);
				return {
					x: (left - 0.5) * width * size,
					y: (top - 0.5) * height * size,
					path: `h${rectWidth}v${rectHeight}h-${rectWidth}Z`,
				};
			}),
		);
	});
}

function appendGlyph(
	parts: string[],
	stamp: GlyphRect[],
	x: number,
	y: number,
) {
	for (const rect of stamp) {
		parts.push(
			`M${(x + rect.x).toFixed(4)},${(y + rect.y).toFixed(4)}${rect.path}`,
		);
	}
}

export function createDotPaths(
	ridgeAt: (x: number) => number,
	blocks: DepthBlock[],
	seams: SurfaceSeam[],
	drawnSeams: DrawnSeam[],
	scale: number,
	gridSize: number,
	dotSize: number,
) {
	const frame = terrainFrame;
	const squareRowStep =
		(gridSize * frame.height * frame.aspectRatio) / frame.width;
	const rowStep = squareRowStep * rowPitchRatio;
	const lightStamps = createStamps(gridSize * dotSize, squareRowStep * dotSize);
	const darkStamps = createStamps(
		gridSize * dotSize * 0.83,
		(squareRowStep * dotSize) / 0.83,
	);
	const lightMarks: string[] = [];
	const darkMarks = darkInkLevels.map(() => [] as string[]);
	const allDrawnSegments = resolveDrawnSeams(
		drawnSeams,
		ridgeAt,
		blocks,
		scale,
	);

	for (let column = 0; column * gridSize < frame.width; column++) {
		const drawX = (column + 0.5) * gridSize;
		const x = drawX / frame.width;
		const { silhouette, ridges } = ridgeColumnsAt(x, ridgeAt, blocks, scale);
		const shadowX = x * frame.aspectRatio;
		const drawnSegments = allDrawnSegments.filter(
			({ x: start, dx }) =>
				shadowX >= Math.min(start, start + dx) - drawnShadowWidth &&
				shadowX <= Math.max(start, start + dx) + drawnShadowWidth,
		);

		const firstRow = Math.max(
			0,
			Math.floor((silhouette * frame.height) / rowStep),
		);
		for (let row = firstRow; (row + 0.5) * rowStep < frame.height; row++) {
			const offsetY = (row + 0.5) * rowStep;
			const y = offsetY / frame.height;
			const ink = terrainInk(x, y, ridges, blocks, seams, drawnSegments, scale);
			const { rank, glyph, scatterX, scatterY, toneThreshold } =
				sampleGlyphCell(column, row);

			const lightSize = glyphSize(ink.light, rank);
			const darkSize = glyphSize(ink.dark, rank);
			if (lightSize === 0 && darkSize === 0) continue;

			const markX = drawX + gridSize * scatterX;
			const markY = frame.top + offsetY + rowStep * scatterY;

			if (lightSize)
				appendGlyph(lightMarks, lightStamps[lightSize][glyph], markX, markY);
			if (darkSize) {
				const level = darkInkLevel(ink.darkTone, toneThreshold);
				appendGlyph(
					darkMarks[level],
					darkStamps[darkSize][glyph],
					markX,
					markY,
				);
			}
		}
	}

	return {
		light: lightMarks.join(" "),
		dark: darkMarks.map((marks) => marks.join(" ")),
	};
}
