import {
	createInitialConfig,
	type Irregularities,
	type RenderSettings,
	type Shape,
	type TerrainConfig,
	type ViewSettings,
} from "./model";
import type { DrawnSeam } from "./shading";

type SetViewAction = {
	[K in keyof ViewSettings]: {
		type: "setView";
		key: K;
		value: ViewSettings[K];
	};
}[keyof ViewSettings];

type SetRenderAction = {
	[K in keyof RenderSettings]: {
		type: "setRender";
		key: K;
		value: RenderSettings[K];
	};
}[keyof RenderSettings];

type SetNoiseAction = {
	[K in keyof Irregularities]: {
		type: "setNoise";
		key: K;
		value: Irregularities[K];
	};
}[keyof Irregularities];

export type TerrainAction =
	| { type: "selectShape"; id: string }
	| { type: "addShape"; shape: Shape }
	| { type: "duplicateShape"; shape: Shape }
	| { type: "updateShape"; patch: Partial<Shape> }
	| { type: "deleteShape" }
	| { type: "moveShape"; direction: -1 | 1 }
	| { type: "toggleSeamDrawing" }
	| { type: "addDrawnSeam"; seam: DrawnSeam }
	| { type: "flipLastSeam" }
	| { type: "undoSeam" }
	| { type: "setReference"; reference: string }
	| { type: "importConfig"; config: TerrainConfig }
	| { type: "loadConfig"; config: TerrainConfig }
	| { type: "importFailed" }
	| { type: "reset" }
	| SetViewAction
	| SetRenderAction
	| SetNoiseAction
	| { type: "setVerticalScale"; value: number }
	| { type: "disableIrregularities" };

export type TerrainState = {
	config: TerrainConfig;
	selectedId: string;
	drawingSeams: boolean;
	reference: string;
	status: string;
	render: RenderSettings;
	view: ViewSettings;
};

export function createInitialState(): TerrainState {
	const config = createInitialConfig();

	return {
		config,
		selectedId: config.shapes[0]?.id ?? "",
		drawingSeams: false,
		reference: "",
		status: "",
		render: { dither: true, gridSize: 0.25, dotSize: 0.76 },
		view: {
			showReference: true,
			showShapes: false,
			showBase: false,
			showGuides: false,
			showSeams: false,
		},
	};
}

function withShapes(
	state: TerrainState,
	shapes: Shape[],
	preferredId = state.selectedId,
): TerrainState {
	const selectedId = shapes.some((shape) => shape.id === preferredId)
		? preferredId
		: (shapes[0]?.id ?? "");

	return {
		...state,
		config: { ...state.config, shapes },
		selectedId,
	};
}

function withDrawnSeams(
	state: TerrainState,
	drawnSeams: DrawnSeam[],
): TerrainState {
	return {
		...state,
		config: { ...state.config, drawnSeams },
	};
}

export function terrainReducer(
	state: TerrainState,
	action: TerrainAction,
): TerrainState {
	switch (action.type) {
		case "selectShape":
			return state.config.shapes.some((shape) => shape.id === action.id)
				? { ...state, selectedId: action.id }
				: state;

		case "addShape":
			return withShapes(
				state,
				[...state.config.shapes, action.shape],
				action.shape.id,
			);

		case "duplicateShape":
			return withShapes(
				state,
				[...state.config.shapes, action.shape],
				action.shape.id,
			);

		case "updateShape":
			return withShapes(
				state,
				state.config.shapes.map((shape) =>
					shape.id === state.selectedId ? { ...shape, ...action.patch } : shape,
				),
			);

		case "deleteShape":
			return withShapes(
				state,
				state.config.shapes.filter((shape) => shape.id !== state.selectedId),
				"",
			);

		case "moveShape": {
			const index = state.config.shapes.findIndex(
				(shape) => shape.id === state.selectedId,
			);
			const target = index + action.direction;
			if (index < 0 || target < 0 || target >= state.config.shapes.length) {
				return state;
			}
			const shapes = [...state.config.shapes];
			[shapes[index], shapes[target]] = [shapes[target], shapes[index]];
			return withShapes(state, shapes);
		}

		case "toggleSeamDrawing":
			return {
				...state,
				drawingSeams: !state.drawingSeams,
				render: { ...state.render, dither: true },
			};

		case "addDrawnSeam":
			return withDrawnSeams(state, [...state.config.drawnSeams, action.seam]);

		case "flipLastSeam":
			return withDrawnSeams(
				state,
				state.config.drawnSeams.map((seam, index, all) =>
					index === all.length - 1
						? { ...seam, side: seam.side === 1 ? -1 : 1 }
						: seam,
				),
			);

		case "undoSeam":
			return withDrawnSeams(state, state.config.drawnSeams.slice(0, -1));

		case "setReference":
			return {
				...state,
				reference: action.reference,
				view: { ...state.view, showReference: true },
			};

		case "importConfig":
			return {
				...state,
				config: action.config,
				selectedId: action.config.shapes[0]?.id ?? "",
				status: "Terrain imported",
			};

		case "loadConfig":
			return {
				...state,
				config: action.config,
				selectedId: action.config.shapes[0]?.id ?? "",
			};

		case "importFailed":
			return { ...state, status: "Invalid terrain JSON" };

		case "reset": {
			const config = createInitialConfig();
			return {
				...state,
				config,
				selectedId: config.shapes[0]?.id ?? "",
				status: "",
			};
		}

		case "setView":
			return {
				...state,
				view: { ...state.view, [action.key]: action.value },
			};

		case "setRender":
			return {
				...state,
				render: { ...state.render, [action.key]: action.value },
			};

		case "setNoise":
			return {
				...state,
				config: {
					...state.config,
					noise: { ...state.config.noise, [action.key]: action.value },
				},
			};

		case "setVerticalScale":
			return {
				...state,
				config: { ...state.config, verticalScale: action.value },
			};

		case "disableIrregularities":
			return {
				...state,
				config: {
					...state.config,
					noise: {
						...state.config.noise,
						largeAmplitude: 0,
						smallAmplitude: 0,
					},
				},
			};
	}
}
