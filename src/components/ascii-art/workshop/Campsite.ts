import type { Plant } from "./SceneScenery";
import { drawRock } from "./WorkshopProps";

function fill(
	ctx: CanvasRenderingContext2D,
	shape: string,
	ink: string | CanvasGradient,
) {
	ctx.fillStyle = ink;
	ctx.fill(new Path2D(shape));
}

function drawCanyon(ctx: CanvasRenderingContext2D) {
	const dusk = ctx.createLinearGradient(0, 145, 0, 428);
	dusk.addColorStop(0, "#544d40");
	dusk.addColorStop(0.48, "#302a22");
	dusk.addColorStop(1, "#11111100");
	fill(
		ctx,
		"M0 226l23-6 32-27 38-5 29-35 52-3 19 6 22 40 34 12 16 31 37 4 29 20 60-4 46 13 36-15 42 1 53 12 37-12 55-3 24-30 26-17 13-28 48 2 15 21 35 9 25 26 33-2 29 12 52 7v172H0Z",
		dusk,
	);

	fill(
		ctx,
		"M123 152l28-1 4 27-12 28-25 24-16-7 11-35Zm687 28 18 2 17 30 30 13 14 16-11 2-31-15-19-8-25-36Z",
		"#71645067",
	);
	fill(
		ctx,
		"M176 150l17 6 22 40 34 12 16 31-32-6-31-20-19-18Zm585 62 23-31 21 1-9 20-8 27-30 12-13-3Z",
		"#181614a0",
	);

	const foreSlope = ctx.createLinearGradient(0, 300, 0, 500);
	foreSlope.addColorStop(0, "#3e362b");
	foreSlope.addColorStop(0.53, "#28231c");
	foreSlope.addColorStop(1, "#11111100");
	fill(
		ctx,
		"M0 339q92-30 197-17t177 18q59 3 123-18 78-25 142-13 59 7 133 12 117-14 228 15v164H0Z",
		foreSlope,
	);
	fill(
		ctx,
		"M0 366q140-49 271-6 78 24 142 5-71 38-159 15-119-33-254 7Zm735 1q101-25 265 8v35q-94-42-165-35Z",
		"#1b1815",
	);
	fill(
		ctx,
		"M36 397q79-41 177-23t167 23q-94 16-174-6t-170 6Zm621-57q67-16 147 2 63 11 158-5-72 29-162 15-84-17-143-12Z",
		"#50433670",
	);
}

function drawCampRocks(ctx: CanvasRenderingContext2D) {
	drawRock(ctx, "cluster", 70, 408, 1.38);
	drawRock(ctx, "slab", 183, 428, 0.6);
	drawRock(ctx, "boulder", 813, 398, 1.2);
	drawRock(ctx, "slab", 860, 419, 0.58);
	drawRock(ctx, "cluster", 963, 443, 0.7);
}

function drawTent(ctx: CanvasRenderingContext2D) {
	const contact = ctx.createLinearGradient(0, 389, 0, 417);
	contact.addColorStop(0, "#161310");
	contact.addColorStop(1, "#1b151000");
	fill(ctx, "M329 392q74-13 184-13l24 8-32 17-145 6Z", contact);

	const canvas = ctx.createLinearGradient(469, 315, 442, 400);
	canvas.addColorStop(0, "#393028");
	canvas.addColorStop(0.63, "#62503f");
	canvas.addColorStop(1, "#8b7155");
	fill(ctx, "M394 313l85 7 51 61-79 17Z", canvas);
	fill(ctx, "M394 313l85 7 4 4-86-7Z", "#8e7b644d");
	fill(ctx, "M427 361l82-6 5 8-82 6Zm19 32 81-15 3 3-79 17Z", "#3a2d23ad");

	const front = ctx.createLinearGradient(342, 387, 455, 391);
	front.addColorStop(0, "#57493a");
	front.addColorStop(0.54, "#77634d");
	front.addColorStop(1, "#9b805e");
	fill(ctx, "M336 394l58-81 57 85Z", front);
	fill(ctx, "M363 391l31-72 34 75Z", "#231b15");
	fill(ctx, "M394 320l7 11 31 64-7-1-22-43-9-23-27 64-7-.5Z", "#9d8465");
	fill(ctx, "M369 390l27-6 24 8 5 3-63-3Z", "#3c2d20");
}

function drawTentLines(ctx: CanvasRenderingContext2D) {
	ctx.strokeStyle = "#695a49";
	ctx.lineWidth = 1;
	ctx.stroke(new Path2D("M389 321 312 399M485 327l64 61"));
	fill(ctx, "M309 400l3-4 2 2-3 4Zm237-10 3-5 2 1-3 5Z", "#8a775f");
}

function drawFirelight(ctx: CanvasRenderingContext2D) {
	ctx.translate(610, 402);
	ctx.scale(1, 0.32);
	const light = ctx.createRadialGradient(0, 0, 2, 0, 0, 101);
	light.addColorStop(0, "#cead7fa3");
	light.addColorStop(0.42, "#ac80544a");
	light.addColorStop(1, "#ac805400");
	ctx.fillStyle = light;
	ctx.fillRect(-101, -101, 202, 202);
}

function drawFireRing(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M579 400q26-9 60-4l7 5-13 8-44 1Z", "#393025");
	for (const [x, y, scale] of [
		[585, 394, 0.22],
		[597, 391, 0.19],
		[614, 391, 0.19],
		[628, 395, 0.22],
		[622, 402, 0.23],
		[608, 404, 0.21],
		[595, 403, 0.24],
		[583, 400, 0.22],
	]) {
		drawRock(ctx, "boulder", x, y, scale);
	}
	fill(ctx, "M591 402l27-9 13 3-35 9Zm1-8 31 6-6 4-29-7Z", "#8c7154");
}

function drawFire(ctx: CanvasRenderingContext2D) {
	const flame = ctx.createLinearGradient(0, 352, 0, 400);
	flame.addColorStop(0, "#ad8663");
	flame.addColorStop(0.52, "#c4a078");
	flame.addColorStop(1, "#f0d7a2");
	fill(
		ctx,
		"M601 399q-13-10-4-22-1 10 4 7 10-18 9-31 16 16 11 30 6-1 10-12 6 16-9 28Z",
		flame,
	);
	fill(ctx, "M605 398q-6-8 4-18-1 8 4 6l3-11q9 11 3 22Z", "#ead2a2");
	for (const [x, y] of [
		[596, 374],
		[608, 352],
		[625, 364],
		[616, 344],
	]) {
		ctx.fillStyle = "#988566";
		ctx.fillRect(x, y, 1.5, 1.1);
	}
}

function drawCampWind(ctx: CanvasRenderingContext2D) {
	fill(
		ctx,
		"M144 356q46-7 111-3l-22 2-59 2Zm527 44 61-7 47 1-43 2-45 7Z",
		"#65544148",
	);
}

export const campsiteLayers = [
	{ id: "canyon-camp", label: "Canyon and wash", draw: drawCanyon },
	{ id: "camp-wind", label: "Wind and dust", draw: drawCampWind },
	{ id: "camp-rocks", label: "Campsite rocks", draw: drawCampRocks },
	{ id: "tent", label: "Tent", draw: drawTent },
	{ id: "tent-lines", label: "Tent lines and stakes", draw: drawTentLines },
	{ id: "firelight", label: "Firelight on the sand", draw: drawFirelight },
	{ id: "fire-ring", label: "Fire ring and logs", draw: drawFireRing },
	{ id: "campfire", label: "Campfire", draw: drawFire },
] as const;

export const campsitePlants = [
	{ kind: "cactus", x: 20, y: 82, width: 7.7 },
	{ kind: "cactus", far: true, x: 78, y: 72, width: 3.8 },
	{ kind: "grass", variant: "fan", x: 15, y: 92, width: 5 },
	{ kind: "grass", variant: "open", x: 36, y: 88, width: 4.1 },
	{ kind: "grass", variant: "leaning", x: 71, y: 90, width: 4.8 },
	{ kind: "grass", variant: "sparse", x: 92, y: 79, width: 3.4 },
] satisfies readonly Plant[];
