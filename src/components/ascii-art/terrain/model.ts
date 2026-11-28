import { desertDitherColumns, desertDotSize } from "../ditherGlyphs";
import {
	type DepthBlock,
	type DrawnSeam,
	isDepthBlock,
	isDrawnSeam,
} from "./shading";
import silhouette from "./silhouette.json";

export type Operation = "max" | "add" | "subtract";

export type SeamShape = {
	toeOffset: number;
	extent: number;
	strength: number;
};

export type Shape = {
	id: string;
	name: string;
	operation: Operation;
	center: number;
	height: number;
	plateau: number;
	leftWidth: number;
	rightWidth: number;
	leftPower: number;
	rightPower: number;
	seam?: SeamShape;
};

export type Irregularities = {
	largeAmplitude: number;
	largeFrequency: number;
	smallAmplitude: number;
	smallFrequency: number;
};

export type RenderSettings = {
	dither: boolean;
	gridSize: number;
	dotSize: number;
};

export const defaultTerrainRenderSettings: RenderSettings = {
	dither: true,
	gridSize: 100 / desertDitherColumns,
	dotSize: desertDotSize,
};

export type ViewSettings = {
	showReference: boolean;
	showShapes: boolean;
	showBase: boolean;
	showGuides: boolean;
	showSeams: boolean;
};

export type TerrainConfig = {
	shapes: Shape[];
	noise: Irregularities;
	verticalScale: number;
	depthBlocks: DepthBlock[];
	drawnSeams: DrawnSeam[];
};

type NumericKey = {
	[K in keyof Shape]-?: Shape[K] extends number ? K : never;
}[keyof Shape];

type ControlDefinition<TKey extends string> = {
	key: TKey;
	label: string;
	min: number;
	max: number;
	step: number;
};

export const shapeControls = [
	{ key: "center", label: "Position", min: 0, max: 100, step: 0.5 },
	{ key: "height", label: "Height", min: 0, max: 100, step: 0.5 },
	{ key: "plateau", label: "Plateau width", min: 0, max: 50, step: 0.5 },
	{
		key: "leftWidth",
		label: "Left slope width",
		min: 0.5,
		max: 100,
		step: 0.5,
	},
	{
		key: "rightWidth",
		label: "Right slope width",
		min: 0.5,
		max: 100,
		step: 0.5,
	},
	{
		key: "leftPower",
		label: "Left curvature",
		min: 0.2,
		max: 5,
		step: 0.1,
	},
	{
		key: "rightPower",
		label: "Right curvature",
		min: 0.2,
		max: 5,
		step: 0.1,
	},
] as const satisfies readonly ControlDefinition<NumericKey>[];

export const noiseControls = [
	{ key: "largeAmplitude", label: "Large amplitude", max: 10 },
	{ key: "largeFrequency", label: "Large frequency", max: 2 },
	{ key: "smallAmplitude", label: "Small amplitude", max: 5 },
	{ key: "smallFrequency", label: "Small frequency", max: 10 },
] as const satisfies readonly {
	key: keyof Irregularities;
	label: string;
	max: number;
}[];

export const shapePresets = {
	Mountain: {
		name: "Mountain",
		operation: "max",
		height: 40,
		plateau: 0,
	},
	Mesa: {
		name: "Mesa",
		operation: "max",
		height: 60,
		plateau: 10,
		leftWidth: 30,
		rightWidth: 10,
		leftPower: 1.5,
		rightPower: 2.5,
	},
	Bump: {
		name: "Bump",
		operation: "add",
		height: 5,
		plateau: 0,
		leftWidth: 4,
		rightWidth: 3,
	},
	Terrace: {
		name: "Terrace",
		operation: "add",
		height: 5,
		plateau: 4,
		leftWidth: 3,
		rightWidth: 2,
	},
	Indentation: {
		name: "Indentation",
		operation: "subtract",
		height: 5,
		plateau: 0,
		leftWidth: 3,
		rightWidth: 3,
	},
} satisfies Record<string, Partial<Shape>>;

export const baseVerticalScale = silhouette.verticalScale;

const legacyImportNoise: Irregularities = {
	largeAmplitude: 1.4,
	largeFrequency: 0.36,
	smallAmplitude: 0.7,
	smallFrequency: 3.7,
};

const shapeKeys: readonly (keyof Shape)[] = [
	"name",
	"operation",
	"center",
	"height",
	"plateau",
	"leftWidth",
	"rightWidth",
	"leftPower",
	"rightPower",
	"seam",
];

function isOperation(value: unknown): value is Operation {
	return value === "max" || value === "add" || value === "subtract";
}

function isSeamShape(value: unknown): value is SeamShape {
	if (!value || typeof value !== "object") return false;

	const { toeOffset, extent, strength } = value as Partial<SeamShape>;
	return (
		typeof toeOffset === "number" &&
		toeOffset >= -1 &&
		toeOffset <= 1 &&
		typeof extent === "number" &&
		extent > 0 &&
		extent <= 1 &&
		typeof strength === "number" &&
		strength >= 0 &&
		strength <= 1
	);
}

const shapeDefaults = {
	name: "Shape",
	operation: "max",
	center: 50,
	height: 30,
	plateau: 5,
	leftWidth: 20,
	rightWidth: 10,
	leftPower: 1,
	rightPower: 1,
} satisfies Omit<Shape, "id">;

export function createShape(overrides: Partial<Shape> = {}): Shape {
	return { ...shapeDefaults, ...overrides, id: crypto.randomUUID() };
}

export function createInitialConfig(): TerrainConfig {
	return {
		shapes: silhouette.shapes.map((shape, index) => ({
			...shapeDefaults,
			...shape,
			operation: shape.operation as Operation,
			id: `default-shape-${index + 1}`,
		})),
		noise: { ...silhouette.noise },
		verticalScale: silhouette.verticalScale,
		depthBlocks: [...silhouette.depthBlocks],
		drawnSeams: silhouette.drawnSeams.filter(isDrawnSeam),
	};
}

function isShapeId(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

export function parseTerrainConfig(value: unknown): TerrainConfig | null {
	const record =
		value && typeof value === "object"
			? (value as Record<string, unknown>)
			: {};
	const imported = Array.isArray(value) ? value : record.shapes;

	if (!Array.isArray(imported)) return null;

	const reservedIds = new Set(
		imported.map((item) => item?.id).filter(isShapeId),
	);
	const assignedIds = new Set<string>();
	const shapes = imported.map((item, index) => {
		const raw =
			item && typeof item === "object" ? (item as Record<string, unknown>) : {};
		const overrides: Record<string, unknown> = {};

		for (const key of shapeKeys) {
			if (key in raw) overrides[key] = raw[key];
		}

		const savedId = raw.id;
		let id: string;
		if (isShapeId(savedId) && !assignedIds.has(savedId)) {
			id = savedId;
		} else {
			id = `legacy-shape-${index + 1}`;
			while (reservedIds.has(id) || assignedIds.has(id)) id += "-";
		}
		assignedIds.add(id);
		const shape = { ...shapeDefaults, ...overrides, id } as Shape;

		if (
			typeof shape.name !== "string" ||
			!isOperation(shape.operation) ||
			(shape.seam !== undefined && !isSeamShape(shape.seam)) ||
			shapeControls.some(
				(control) =>
					typeof shape[control.key] !== "number" ||
					!Number.isFinite(shape[control.key]) ||
					shape[control.key] < control.min ||
					shape[control.key] > control.max,
			)
		) {
			throw new Error("Invalid shape");
		}

		return shape;
	});

	const noise = {
		...legacyImportNoise,
		...((record.noise ?? {}) as Partial<Irregularities>),
	};

	if (
		noiseControls.some(
			(control) =>
				typeof noise[control.key] !== "number" ||
				!Number.isFinite(noise[control.key]) ||
				noise[control.key] < 0 ||
				noise[control.key] > control.max,
		)
	) {
		throw new Error("Invalid irregularities");
	}

	const verticalScale = record.verticalScale ?? 1;
	if (
		typeof verticalScale !== "number" ||
		!Number.isFinite(verticalScale) ||
		verticalScale < 0.2 ||
		verticalScale > 2
	) {
		throw new Error("Invalid vertical scale");
	}

	const depthBlocks = record.depthBlocks ?? [];
	if (
		!Array.isArray(depthBlocks) ||
		!depthBlocks.every((block) => isDepthBlock(block))
	) {
		throw new Error("Invalid depth blocks");
	}

	const drawnSeams = record.drawnSeams ?? [];
	if (
		!Array.isArray(drawnSeams) ||
		!drawnSeams.every((seam) => isDrawnSeam(seam))
	) {
		throw new Error("Invalid drawn seams");
	}

	return {
		shapes,
		noise: noise as Irregularities,
		verticalScale,
		depthBlocks,
		drawnSeams,
	};
}
