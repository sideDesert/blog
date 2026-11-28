import { fabricInk, flameInk, hempInk, metalInk, woodInk } from "./materialInk";
import { fill } from "./canvasShapes";
import { drawRock } from "./DesertDetails";
import type { Plant } from "./SceneScenery";

export const aboutRidge = [
	[0, 226],
	[23, 220],
	[55, 193],
	[93, 188],
	[122, 153],
	[174, 150],
	[193, 156],
	[215, 196],
	[249, 208],
	[265, 239],
	[302, 243],
	[331, 263],
	[391, 259],
	[437, 272],
	[473, 257],
	[515, 258],
	[568, 270],
	[605, 258],
	[660, 255],
	[684, 225],
	[710, 208],
	[723, 180],
	[771, 182],
	[786, 203],
	[821, 212],
	[846, 238],
	[879, 236],
	[908, 248],
	[960, 255],
	[1000, 263],
] as const;

function drawCanyon(ctx: CanvasRenderingContext2D) {
	const dusk = ctx.createLinearGradient(0, 145, 0, 428);
	dusk.addColorStop(0, "#685849");
	dusk.addColorStop(0.48, "#382e24");
	dusk.addColorStop(1, "#11111100");
	fill(ctx, `M${aboutRidge.join(" ")}v164H0Z`, dusk);
}

function drawCanyonFaces(ctx: CanvasRenderingContext2D) {
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
	const sediment = ctx.createLinearGradient(0, 170, 0, 250);
	sediment.addColorStop(0, "#7464506a");
	sediment.addColorStop(1, "#463a2b00");
	fill(
		ctx,
		`M109 199q25-14 45-18-5 6-17 13l-22 10-17 14Z
		M129 222q18-15 24-28l11-12 6 4-17 22-22 19-19 7Z
		M764 204l18-16 12-3-9 11-11 8-13 18-10 4Z`,
		sediment,
	);
}

function drawCanyonWash(ctx: CanvasRenderingContext2D) {
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

const campRockLayers = (
	[
		["west-camp-rock", "West rock cluster", "cluster", 70, 408, 1.38],
		["tent-rock", "Flat rock by the tent", "slab", 183, 428, 0.6],
		["east-camp-boulder", "East campsite boulder", "boulder", 813, 398, 1.2],
		["east-camp-rock", "Flat rock beside the boulder", "slab", 860, 419, 0.58],
		[
			"edge-camp-rock",
			"Rock cluster at the east edge",
			"cluster",
			963,
			443,
			0.7,
		],
	] as const
).map(([id, label, kind, x, y, scale]) => ({
	id,
	label,
	group: "Campsite rocks",
	draw: (ctx: CanvasRenderingContext2D) => drawRock(ctx, kind, x, y, scale),
}));

function drawTentShadow(ctx: CanvasRenderingContext2D) {
	const contact = ctx.createLinearGradient(0, 389, 0, 417);
	contact.addColorStop(0, "#161310");
	contact.addColorStop(1, "#1b151000");
	fill(ctx, "M329 392q74-13 184-13l24 8-32 17-145 6Z", contact);
}

const tentFly = "M394 313l85 7 51 61-79 17Z";

function drawTentFly(ctx: CanvasRenderingContext2D) {
	const canvas = ctx.createLinearGradient(469, 315, 442, 400);
	canvas.addColorStop(0, fabricInk("#352c24"));
	canvas.addColorStop(0.63, fabricInk("#554637"));
	canvas.addColorStop(1, fabricInk("#80684f"));
	fill(ctx, tentFly, canvas);
}

function drawTentFolds(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(tentFly));
	const ridge = ctx.createLinearGradient(435, 317, 450, 361);
	ridge.addColorStop(0, fabricInk("#9c866b56"));
	ridge.addColorStop(1, fabricInk("#62503f00"));
	fill(
		ctx,
		"M394 313l85 7q-34 2-70 12Z M441 317l17 2 53 49q-28-13-52-38Z",
		ridge,
	);
	const folds = ctx.createLinearGradient(444, 347, 490, 393);
	folds.addColorStop(0, fabricInk("#21191200"));
	folds.addColorStop(0.51, fabricInk("#34271c65"));
	folds.addColorStop(1, fabricInk("#31251aa0"));
	fill(
		ctx,
		"M442 330q29 28 79 43l9 8q-42-6-58-20Z M422 351q20 19 53 34l-24 13-20-23Z",
		folds,
	);
	fill(ctx, "M447 392l80-14 3 3-79 17Z", fabricInk("#35291f80"));
}

function drawTentFront(ctx: CanvasRenderingContext2D) {
	const front = ctx.createLinearGradient(342, 387, 455, 391);
	front.addColorStop(0, fabricInk("#57493a"));
	front.addColorStop(0.54, fabricInk("#77634d"));
	front.addColorStop(1, fabricInk("#9b805e"));
	fill(ctx, "M336 394l58-81 57 85Z", front);
}

function drawTentDoor(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M363 391l31-72 34 75Z", fabricInk("#231b15"));
	fill(
		ctx,
		"M394 320l7 11 31 64-7-1-22-43-9-23-27 64-7-.5Z",
		fabricInk("#9d8465"),
	);
}

function drawTentThreshold(ctx: CanvasRenderingContext2D) {
	const canvas = ctx.createLinearGradient(0, 384, 0, 395);
	canvas.addColorStop(0, fabricInk("#211a14"));
	canvas.addColorStop(0.77, fabricInk("#453527"));
	canvas.addColorStop(1, fabricInk("#281e17"));
	fill(ctx, "M369 390l27-6 24 8 5 3-63-3Z", canvas);
}

function drawTentLines(ctx: CanvasRenderingContext2D) {
	ctx.strokeStyle = hempInk("#695a49");
	ctx.lineWidth = 1;
	ctx.stroke(new Path2D("M389 321 312 399M485 327l64 61"));
}

function drawTentStakes(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M309 400l3-4 2 2-3 4Zm237-10 3-5 2 1-3 5Z", metalInk("#8a775f"));
}

function drawTentFirelight(ctx: CanvasRenderingContext2D, seconds = 0) {
	ctx.globalAlpha =
		0.72 + 0.18 * Math.sin(seconds * 12) + 0.08 * Math.sin(seconds * 21);
	const warmth = ctx.createRadialGradient(506, 386, 0, 506, 386, 64);
	warmth.addColorStop(0, flameInk("#d8a4795a"));
	warmth.addColorStop(0.28, flameInk("#c99a6741"));
	warmth.addColorStop(1, flameInk("#b7896100"));
	fill(ctx, tentFly, warmth);
}

function drawFirelight(ctx: CanvasRenderingContext2D, seconds = 0) {
	ctx.globalAlpha =
		0.84 + 0.11 * Math.sin(seconds * 12) + 0.05 * Math.sin(seconds * 21);
	ctx.translate(610, 402);
	ctx.scale(1, 0.32);
	const light = ctx.createRadialGradient(0, 0, 2, 0, 0, 101);
	light.addColorStop(0, flameInk("#cead7fa3"));
	light.addColorStop(0.42, flameInk("#ac80544a"));
	light.addColorStop(1, flameInk("#ac805400"));
	ctx.fillStyle = light;
	ctx.fillRect(-101, -101, 202, 202);
}

function drawFireBed(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M579 400q26-9 60-4l7 5-13 8-44 1Z", "#393025");
}

const fireRingLayers = [
	[585, 394, 0.22],
	[597, 391, 0.19],
	[614, 391, 0.19],
	[628, 395, 0.22],
	[622, 402, 0.23],
	[608, 404, 0.21],
	[595, 403, 0.24],
	[583, 400, 0.22],
].map(([x, y, scale], index) => ({
	id: `fire-ring-stone-${index + 1}` as const,
	label: `Fire-ring stone ${index + 1}`,
	group: "Campfire",
	draw: (ctx: CanvasRenderingContext2D) =>
		drawRock(ctx, "boulder", x, y, scale),
}));

function drawBackFireLog(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M592 394l31 6-6 4-29-7Z", woodInk("#7a6048"));
	fill(ctx, "M592 394l31 6-1 1-32-6Z", woodInk("#ac8961"));
}

function drawFrontFireLog(ctx: CanvasRenderingContext2D) {
	const bark = ctx.createLinearGradient(0, 394, 0, 405);
	bark.addColorStop(0, woodInk("#b89971"));
	bark.addColorStop(1, woodInk("#534133"));
	fill(ctx, "M591 402l27-9 13 3-35 9Z", bark);
	fill(ctx, "M591 402l5 3 3-1 1-2-5-1Z", woodInk("#907355"));
}

function drawOuterFlame(ctx: CanvasRenderingContext2D, seconds = 0) {
	ctx.translate(610, 400);
	ctx.transform(
		1,
		0,
		Math.sin(seconds * 8.3) * 0.12,
		1 + Math.sin(seconds * 11.1) * 0.1 + Math.sin(seconds * 17.2) * 0.06,
		0,
		0,
	);
	ctx.translate(-610, -400);
	const flame = ctx.createLinearGradient(0, 352, 0, 400);
	flame.addColorStop(0, flameInk("#a85a37"));
	flame.addColorStop(0.52, flameInk("#cb864d"));
	flame.addColorStop(1, flameInk("#eab577"));
	fill(
		ctx,
		"M600 399q-13-8-6-22 0 10 6 8 12-15 10-32 17 17 11 30 7-1 11-11 6 14-9 27Z",
		flame,
	);
}

function drawInnerFlame(ctx: CanvasRenderingContext2D, seconds = 0) {
	ctx.translate(610, 400);
	ctx.transform(
		1,
		0,
		Math.sin(seconds * 12.6 + 0.8) * 0.11,
		1 + Math.sin(seconds * 14.8) * 0.12,
		0,
		0,
	);
	ctx.translate(-610, -400);
	fill(ctx, "M605 398q-6-8 4-18-1 8 4 6l3-11q9 11 3 22Z", flameInk("#ead2a2"));
}

function drawEmbers(ctx: CanvasRenderingContext2D, seconds = 0) {
	for (let ember = 0; ember < 7; ember++) {
		const rise = (seconds * (0.56 + ember * 0.055) + ember * 0.29) % 1;
		const x = 600 + ((ember * 13) % 24) + rise * Math.sin(ember + rise * 4) * 9;
		ctx.globalAlpha = Math.sin(rise * Math.PI) * 0.88;
		ctx.fillStyle = flameInk("#e1aa70");
		ctx.fillRect(x, 387 - rise * 58, 1.4, 1.2);
	}
}

const campfireMotion = {
	x: 439,
	y: 319,
	width: 277,
	height: 118,
	trigger: "frame",
} as const;

export const campsiteTerrainLayers = [
	{ id: "canyon-camp", label: "Canyon silhouette", draw: drawCanyon },
	{ id: "canyon-faces", label: "Canyon stone faces", draw: drawCanyonFaces },
	{ id: "canyon-wash", label: "Sand in the canyon wash", draw: drawCanyonWash },
] as const;

export const campsiteLayers = [
	...campRockLayers,
	{
		id: "tent-shadow",
		label: "Tent shadow",
		group: "Tent",
		draw: drawTentShadow,
	},
	{ id: "tent-fly", label: "Tent fly", group: "Tent", draw: drawTentFly },
	{
		id: "tent-folds",
		label: "Tent fabric folds",
		group: "Tent",
		draw: drawTentFolds,
	},
	{
		id: "tent-front",
		label: "Tent frontage",
		group: "Tent",
		draw: drawTentFront,
	},
	{
		id: "tent-door",
		label: "Tent entrance",
		group: "Tent",
		draw: drawTentDoor,
	},
	{
		id: "tent-threshold",
		label: "Tent threshold",
		group: "Tent",
		draw: drawTentThreshold,
	},
	{
		id: "tent-lines",
		label: "Tent guylines",
		group: "Tent",
		draw: drawTentLines,
	},
	{
		id: "tent-stakes",
		label: "Tent stakes",
		group: "Tent",
		draw: drawTentStakes,
	},
	{
		id: "tent-firelight",
		label: "Firelight on the tent",
		group: "Tent",
		draw: drawTentFirelight,
		nightOnly: true,
		motion: [campfireMotion],
	},
	{
		id: "firelight",
		label: "Firelight on the sand",
		group: "Campfire",
		draw: drawFirelight,
		nightOnly: true,
		motion: [campfireMotion],
	},
	{ id: "fire-bed", label: "Fire bed", group: "Campfire", draw: drawFireBed },
	...fireRingLayers,
	{
		id: "back-fire-log",
		label: "Back fire log",
		group: "Campfire",
		draw: drawBackFireLog,
	},
	{
		id: "front-fire-log",
		label: "Front fire log",
		group: "Campfire",
		draw: drawFrontFireLog,
	},
	{
		id: "outer-flame",
		label: "Outer flame",
		group: "Campfire",
		draw: drawOuterFlame,
		nightOnly: true,
		motion: [campfireMotion],
	},
	{
		id: "inner-flame",
		label: "Inner flame",
		group: "Campfire",
		draw: drawInnerFlame,
		nightOnly: true,
		motion: [campfireMotion],
	},
	{
		id: "embers",
		label: "Rising embers",
		group: "Campfire",
		draw: drawEmbers,
		nightOnly: true,
		motion: [campfireMotion],
	},
] as const;

export const campsitePlants = [
	{
		id: "plant-cactus",
		label: "Cactus by the tent",
		species: "cactus",
		x: 20,
		y: 82,
		width: 7.7,
	},
	{
		id: "plant-far-cactus",
		label: "Distant campsite cactus",
		species: "cactus",
		far: true,
		x: 78,
		y: 72,
		width: 3.8,
	},
	{
		id: "plant-west-grass",
		label: "West campsite grass",
		species: "grass",
		variant: "fan",
		x: 15,
		y: 92,
		width: 5,
	},
	{
		id: "plant-tent-grass",
		label: "Grass by the tent",
		species: "grass",
		variant: "open",
		x: 36,
		y: 88,
		width: 4.1,
	},
	{
		id: "plant-fire-grass",
		label: "Grass past the fire",
		species: "grass",
		variant: "leaning",
		x: 71,
		y: 90,
		width: 4.8,
	},
	{
		id: "plant-east-grass",
		label: "East campsite grass",
		species: "grass",
		variant: "sparse",
		x: 92,
		y: 79,
		width: 3.4,
	},
] satisfies readonly Plant[];
