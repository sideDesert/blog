import type { DitherDetail } from "./ditherCanvas";

export type Layer = {
	id: string;
	label: string;
	group?: string;
};

export type MotionRegion = {
	x: number;
	y: number;
	width: number;
	height: number;
	trigger: "frame" | "flicker" | "beacon";
};

export type CanvasLayer = Layer & {
	draw: (context: CanvasRenderingContext2D, amount?: number) => void;
	motion?: readonly MotionRegion[];
	brightness?: true;
	beacon?: { requires: string };
	nightOnly?: true;
	daylight?: (
		context: CanvasRenderingContext2D,
		dither: boolean,
		amount?: number,
	) => void;
	paperFace?: string;
	detail?: DitherDetail;
};
