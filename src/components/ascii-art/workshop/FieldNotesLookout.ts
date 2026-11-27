import { fill } from "./canvasShapes";

function drawLookoutFoundation(ctx: CanvasRenderingContext2D) {
	const stone = ctx.createLinearGradient(0, 215, 0, 242);
	stone.addColorStop(0, "#786856b0");
	stone.addColorStop(0.54, "#574a3daa");
	stone.addColorStop(1, "#30271e00");
	fill(
		ctx,
		`M804 224l8-2 4-6 7 1 10-2 11 3 10-1 6 4 7-4 7 1 6 7-15 3-18-2-21 2-17 5-11-2Z
		M804 229l9-5 7 1-4 5-13 5Zm16 3 10-5 8 1-8 5-11 2Z`,
		stone,
	);
	fill(ctx, "M821 227l9-3 6 1-3 3-9 1Zm22 0 8-3 7 1-3 3-12 1Z", "#695a4a");
}

function drawLookoutWestRubble(ctx: CanvasRenderingContext2D) {
	const stone = ctx.createLinearGradient(811, 216, 822, 232);
	stone.addColorStop(0, "#a08d74");
	stone.addColorStop(0.38, "#80705b");
	stone.addColorStop(1, "#524638");
	fill(
		ctx,
		`M802 228l4-4 4-.4 2 2-3 3Z
		M810 224l4-5 4-2 5 1-3 3-6 1Z
		M816 231l5-6 5-2 4 .4-2 3-4 1-2 3Z`,
		stone,
	);
}

function drawLookoutEastRubble(ctx: CanvasRenderingContext2D) {
	const stone = ctx.createLinearGradient(866, 216, 876, 231);
	stone.addColorStop(0, "#8f7e65");
	stone.addColorStop(1, "#463b30");
	fill(
		ctx,
		"M857 225l4-3 4 .7 1.6 2-3 1.4Zm9-4 3-4 4-.6 3.7 2.8-1.9 2.2-5 .8Zm9 4 4-2 4 3-4 1Z",
		stone,
	);
}

function drawLookoutWestWall(ctx: CanvasRenderingContext2D) {
	const west = ctx.createLinearGradient(820, 205, 839, 219);
	west.addColorStop(0, "#827360");
	west.addColorStop(0.54, "#716250");
	west.addColorStop(1, "#5e5141");
	fill(ctx, "M821 203l19-2 1.2 18-20.7 2.2Z", west);
}

function drawLookoutEastWall(ctx: CanvasRenderingContext2D) {
	const east = ctx.createLinearGradient(840, 201, 857, 218);
	east.addColorStop(0, "#665949");
	east.addColorStop(0.45, "#4f4336");
	east.addColorStop(1, "#302920");
	fill(ctx, "M840 201l15.5 1 2 18-16.3-1Z", east);
}

function drawLookoutCoping(ctx: CanvasRenderingContext2D) {
	const stone = ctx.createLinearGradient(823, 202, 857, 201);
	stone.addColorStop(0, "#9a8a71");
	stone.addColorStop(0.54, "#857761");
	stone.addColorStop(1, "#5e5143");
	fill(ctx, "M821 203l7-2.6 20-.3 7.5 1.9-1.3 1.4-13.2-.6-20 1.7Z", stone);
}

function drawLookoutOpening(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M828.8 206.2l7.8-.6v6.7l-7.5.6Z", "#201b17");
	fill(ctx, "M828 205.6l9-1v1.2l-9 .9Zm0 7.8 9-.8v1.2l-9 1Z", "#8a7963");
	fill(ctx, "M835.9 206.1h.9v6.3h-.9Z", "#635644");
}

function drawLookoutCourses(ctx: CanvasRenderingContext2D) {
	fill(
		ctx,
		`M822 207l4-.4v1.05l-4 .4Zm.4 3.4l3.7-.4v1.1l-3.7.4Z
		M822 216l6.4-.7v1.4l-6.4.6Zm9-.9 7.5-.7v1.2l-7.5.7Z
		M824 218.5l8-.8v1.2l-8 .8Zm9.5-.9 5-.6v1.3l-5 .6Z
		M842 205.1l6 .2v.8l-6-.2Zm7.1 3.1 5 .4v1l-5-.4Zm-6.1 4 6 .3v1l-6-.3Zm8.8 2.5 3.5.3v1l-3.5-.3Z`,
		"#8c7b6463",
	);
}

const wallAndStoneLayers = (
	[
		[
			"lookout-west-rubble",
			"Lookout west foundation stones",
			drawLookoutWestRubble,
		],
		[
			"lookout-east-rubble",
			"Lookout east foundation stones",
			drawLookoutEastRubble,
		],
		["lookout-west-wall", "Lookout west wall", drawLookoutWestWall],
		["lookout-east-wall", "Lookout east wall", drawLookoutEastWall],
		["lookout-coping", "Lookout coping stones", drawLookoutCoping],
		["lookout-opening", "Lookout opening", drawLookoutOpening],
		["lookout-courses", "Lookout masonry courses", drawLookoutCourses],
	] as const
).map(([id, label, draw]) => ({ id, label, draw, group: "Stone lookout" }));

export const lookoutDither = {
	path: "M797 222l19-9 3-15 38-1 4 17 18 8v12h-82Z",
	left: 797,
	top: 197,
	right: 879,
	bottom: 234,
	pitchScale: 0.68,
};

export const lookoutLayers = [
	{
		id: "lookout-foundation",
		label: "Lookout foundation",
		draw: drawLookoutFoundation,
	},
	...wallAndStoneLayers,
] as const;
