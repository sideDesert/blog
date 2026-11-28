import { fill, fillTerrainContours, stroke } from "./canvasShapes";
import { cliffFaces } from "./cliffFaces";
import { rockLayer } from "./DesertDetails";
import { lookoutDither, lookoutLayers } from "./FieldNotesLookout";
import { notebookLayers } from "./FieldNotesNotebook";
import {
	fieldNotesVegetationLayers,
	ledgeScrubLayer,
} from "./FieldNotesPlants";
import {
	drawStratifiedBoulder,
	eastFieldBoulder,
	eastFieldFragment,
	middleFieldBoulder,
	westFieldBoulder,
	westFieldFragment,
} from "./foregroundBoulders";
import { ledgeFaces } from "./ledgeFaces";
import { lookoutFaces } from "./lookoutFaces";
import { valleyContours } from "./valleyContours";

export const blogRidge = [
	[0, 140],
	[21, 133],
	[53, 131],
	[85, 129],
	[111, 125],
	[132, 125],
	[138, 128],
	[142, 134],
	[145, 154],
	[164, 155],
	[176, 158],
	[180, 160],
	[184, 171],
	[197, 172],
	[216, 171],
	[238, 169],
	[249, 167],
	[267, 168],
	[282, 169],
	[294, 173],
	[299, 192],
	[305, 195],
	[314, 205],
	[324, 215],
	[339, 221],
	[373, 223],
	[393, 228],
	[411, 221],
	[440, 216],
	[483, 214],
	[520, 227],
	[577, 227],
	[614, 235],
	[649, 233],
	[701, 239],
	[738, 234],
	[771, 244],
	[807, 243],
	[846, 229],
	[877, 232],
	[922, 225],
	[959, 235],
	[1000, 230],
] as const;

const escarpmentSkyline = `M${blogRidge.join(" ")}V327H0Z`;

function drawDistantCliffBench(ctx: CanvasRenderingContext2D) {
	ctx.clip(
		new Path2D(
			"M333 211l10-6 22-3 13-3 25-2 15 1 20 4 8 5 7 7 17 2 15 10v12H333Z",
		),
	);
	const stone = ctx.createLinearGradient(0, 196, 0, 238);
	stone.addColorStop(0, "#2c271f");
	stone.addColorStop(0.63, "#24201b");
	stone.addColorStop(1, "#18161300");
	ctx.fillStyle = stone;
	ctx.fillRect(333, 196, 152, 42);
	fillTerrainContours(ctx, cliffFaces);
}

function drawEscarpment(ctx: CanvasRenderingContext2D) {
	const wash = ctx.createLinearGradient(0, 129, 0, 325);
	wash.addColorStop(0, "#4c4135");
	wash.addColorStop(0.55, "#28231e");
	wash.addColorStop(1, "#151514");
	ctx.fillStyle = wash;
	ctx.fill(new Path2D(escarpmentSkyline));

	fill(
		ctx,
		"M0 275q125-22 220-2t212 22q75-37 161-27 37-21 84-27l79-3 43-13 20-10 37 1 47 32 97 3v125H0Z",
		"#201e1b",
	);
	const valleyFloor = ctx.createLinearGradient(0, 305, 0, 500);
	valleyFloor.addColorStop(0, "#1b1a18");
	valleyFloor.addColorStop(0.67, "#181715");
	valleyFloor.addColorStop(1, "#131312");
	fill(
		ctx,
		"M0 319q203-48 395 13 90 6 190-24 93-30 179-39 120 19 236-8v239H0Z",
		valleyFloor,
	);
}

function drawCliffFaces(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(escarpmentSkyline));
	fillTerrainContours(ctx, cliffFaces);
}

function drawCliffShadows(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(escarpmentSkyline));
	const stone = ctx.createLinearGradient(0, 127, 0, 263);
	stone.addColorStop(0, "#332a22");
	stone.addColorStop(0.54, "#1d1916");
	stone.addColorStop(0.8, "#201b17a8");
	stone.addColorStop(1, "#201b1700");
	ctx.fillStyle = stone;
	ctx.fillRect(0, 120, 470, 143);
}

const cliffReliefLayers = (
	[
		[
			"west-cliff-crown",
			"Lit cap of the west cliff",
			123,
			147,
			"#87745b50",
			"#69574418",
			`M13 134l23-2 34-4 27-2 19-2 12 3-12 4-21 1-20 2-18 3-22 1-18 3Z
			M29 140l30-4 30-3 26-2-9 5-23 3-26 1-20 2Z`,
		],
		[
			"west-cliff-flutes",
			"Weathered ribs in the west cliff",
			137,
			188,
			"#7968534c",
			"#57473620",
			`M62 139l6 0-1 15 1 8-5 7-4-1 3-11Z
			M91 138l4-2 2 17 2 8-5 12-3-3 2-9-1-12Z
			M104 135l4-2 3 20 4 13 4 7-5 3-6-14-2-12Z
			M123 134l4-2 3 17 4 8 1 12 8 11-5 2-7-12-1-11-4-8Z
			M149 156l5-2 3 14 3 10 6 8-6 1-6-9-2-10Z
			M167 156l6 1 4 15 5 11-6-3-5-13Z`,
		],
		[
			"western-bench-crown",
			"Cap of the next sandstone bench",
			166,
			213,
			"#88775f50",
			"#66524021",
			`M185 175l28-3 25-3 19-2 18 1 15 4 7 10-9-3-7-4-17-2-23 1-24 2-23 2Z
			M226 177l5-1 1 12-3 6-3-4Z
			M280 177l6 0 5 13 6 5 10 10-5 2-10-9-5-8Z`,
		],
		[
			"west-cliff-talus",
			"Glancing light across the fallen slope",
			190,
			277,
			"#76624a4a",
			"#64523e2d",
			`M70 185q22 4 39 10l23 3 26 9 33 8 40 2-12 4-31-1-37-9-27-7-26-4-23-10Z
			M87 272q25-14 52-20 20-3 42-1l30 5-18 1-18-2-29 1-26 8-22 10Z
			M212 260l28-5 23 1 21 6 33 3-11 4-27-3-17-5-22-2-20 4Z`,
		],
	] as const
).map(([id, label, top, bottom, light, shade, face]) => ({
	id,
	label,
	group: "Western cliff relief",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.clip(new Path2D(escarpmentSkyline));
		const stone = ctx.createLinearGradient(0, top, 0, bottom);
		stone.addColorStop(0, light);
		stone.addColorStop(1, shade);
		ctx.filter = "blur(0.8px)";
		fill(ctx, face, stone);
	},
}));

function drawValleyFolds(ctx: CanvasRenderingContext2D) {
	fillTerrainContours(ctx, valleyContours);
}

function drawValleyRill(ctx: CanvasRenderingContext2D) {
	const shadow = ctx.createLinearGradient(253, 355, 464, 307);
	shadow.addColorStop(0, "#17131000");
	shadow.addColorStop(0.26, "#17131084");
	shadow.addColorStop(0.67, "#16131094");
	shadow.addColorStop(1, "#16131000");
	ctx.filter = "blur(2px)";
	stroke(ctx, "M245 357C284 358 308 346 338 339S382 312 424 313", shadow, 8);

	const sunlitSand = ctx.createLinearGradient(253, 355, 437, 308);
	sunlitSand.addColorStop(0, "#67574300");
	sunlitSand.addColorStop(0.15, "#69594567");
	sunlitSand.addColorStop(0.55, "#75634e95");
	sunlitSand.addColorStop(0.76, "#79665085");
	sunlitSand.addColorStop(1, "#69594500");
	stroke(
		ctx,
		"M255 349C282 352 306 338 333 333S373 313 400 309Q415 306 432 309",
		sunlitSand,
		6.2,
	);
}

function drawValleyRidge(ctx: CanvasRenderingContext2D) {
	const shale = ctx.createLinearGradient(0, 245, 0, 310);
	shale.addColorStop(0, "#493d32");
	shale.addColorStop(0.52, "#29221c");
	shale.addColorStop(1, "#27201b00");
	fill(
		ctx,
		`M363 279l37-6 26-6 21-3 13-9 12 1 7 5 23 1 14-8 11 1
		17 3 23-5 7-7 12 2 7 8 14 1 14 5 14 1 28 8-25 10-56 1-36 8
		-70-3-44 8-48-3-22-9Z`,
		shale,
	);
	fill(
		ctx,
		`M381 278l35-8 29-6 15-9 12 1 8 6-10-3-11 1-12 8-29 5Z
		M483 267l20-5 13-8 12 1 17 3 22-5 7-7 12 2 6 8-8-4-12 0-4 5-25 5-24-3-17 6Z
		M558 270l24-8 24-5 16 5 13 1 15 5-19 0-13-4-31 1-19 5Z`,
		"#74655375",
	);
	fill(
		ctx,
		`M428 277q53-6 97-4l64-8 31 2-30 3-65 8-48 2-47 1Z
		M489 291q45-1 72-8l68-3-31 4-36 2-46 9Z
		M77 315q66-3 104 4l65 1 56-5-52 10-68 0-52-5Z
		M162 336q74-6 138 0l43-6-20 7-31 2-68-1Z
		M361 352q53-6 91-3l64-10-25 8-40 5-54 3Z`,
		"#5b4f4148",
	);
}

const lookoutRiseOutline =
	"M609 294q63-14 101-27l32-12 24-19 19-9 15-2 19-10 31-2 15 5 21-2 26 10 20 15 28 8 26 21-39 32-113 10-114-4-83 25Z";

function drawLookoutRise(ctx: CanvasRenderingContext2D) {
	const shade = ctx.createLinearGradient(818, 223, 849, 326);
	shade.addColorStop(0, "#2d271f");
	shade.addColorStop(0.45, "#27221d");
	shade.addColorStop(1, "#201c1800");
	fill(ctx, lookoutRiseOutline, shade);
	fillTerrainContours(ctx, lookoutFaces);
	fill(
		ctx,
		`M610 298q39-13 80-15l28-9-7 6-23 6-40 5-38 11Z
		M611 312q40-12 72-13l37-8-14 6-47 8-49 11Z
		M619 322l46-11-10 6-32 8Z
		M789 280q26-13 52-12l48 6-19 0-33-3-32 5Z`,
		"#51473a84",
	);
}

const lookoutSlopeLayers = (
	[
		[
			"lookout-west-ribs",
			"Sandstone ribs below the lookout",
			218,
			275,
			"#806c537b",
			"#66543f16",
			`M819 217l13-3-5 12-7 7-14 4-10 12-8 2 7-17 15-9Z
			M796 225l12-4-4 9-12 8-5 11-11 11-17 8-6-2 17-14 6-15Z
			M778 230l12-2-6 8-12 10-12 9-18 5 16-11 9-11Z
			M832 225l15-4-6 12-13 13-15 9-13 3 13-12 9-11Z`,
		],
		[
			"lookout-lower-benches",
			"Low rock shelves beside the trail",
			252,
			287,
			"#76624967",
			"#68533d26",
			`M669 278q28-6 52-18l14-4-5 6-16 9-34 9-19 3Z
			M706 276q27-9 45-14l28-12-6 7-19 12-28 7-22 7Z
			M747 275q20-10 39-12l42-11-15 6-28 10-26 5-14 8Z
			M828 268l28-6 22 2 14 7-12-3-24-1-23 4Z`,
		],
		[
			"lookout-east-runoff",
			"Runoff below the east side of the lookout",
			271,
			317,
			"#65574050",
			"#4c3e2c0e",
			`M870 273q37 0 62 13l40-3-14 6-26 2-25-10-30-4Z
			M849 287l40-3 45 9-20 2-25-4-35 1Z
			M800 306q33-5 60-4l27-5-11 7-32 3-33 2Z`,
		],
	] as const
).map(([id, label, top, bottom, lit, shade, contour]) => ({
	id,
	label,
	group: "Lookout slope",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.clip(new Path2D(lookoutRiseOutline));
		ctx.filter = "blur(0.95px)";
		const stone = ctx.createLinearGradient(0, top, 0, bottom);
		stone.addColorStop(0, lit);
		stone.addColorStop(1, shade);
		fill(ctx, contour, stone);
	},
}));

const upperTrail = `M760 272C755 274 748 275 750 278
	C752 282 761 284 768 288C776 292 778 296 769 300
	C759 304 743 307 721 313C702 318 683 323 684 329`;
const lowerTrail = "C684 333 694 333 694 339C693 348 670 352 644 359";

const lookoutSlopeRocks = [
	rockLayer("lookout-bank-chip", "Chip low on the lookout bank", [
		"slab",
		640,
		287,
		0.23,
	]),
	rockLayer("lookout-bank-stone", "Stone on the lower lookout bank", [
		"angular",
		666,
		276,
		0.28,
	]),
	rockLayer("lookout-west-fragment", "West lookout slope fragment", [
		"boulder",
		692,
		265,
		0.3,
	]),
	rockLayer("lookout-mid-fragment", "Middle lookout slope fragment", [
		"angular",
		715,
		260,
		0.31,
	]),
	rockLayer("lookout-shelf-stone", "Stone on the middle lookout shelf", [
		"slab",
		730,
		254,
		0.3,
	]),
	rockLayer("lookout-upper-fragment", "Upper lookout slope fragment", [
		"angular",
		744,
		249,
		0.39,
	]),
	rockLayer("lookout-rim-chip", "Chip at the lookout rim", [
		"slab",
		760,
		247,
		0.31,
	]),
	rockLayer("lookout-rim-stone", "Stone at the upper lookout rim", [
		"boulder",
		786,
		235,
		0.32,
	]),
].map((layer) => ({
	...layer,
	group: "Lookout slope rocks",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.globalAlpha = 0.72;
		layer.draw(ctx);
	},
}));

function drawTrailShoulders(ctx: CanvasRenderingContext2D) {
	ctx.filter = "blur(2.5px)";
	ctx.lineCap = "round";
	const wornSand = ctx.createLinearGradient(0, 270, 0, 368);
	wornSand.addColorStop(0, "#6e5d4a00");
	wornSand.addColorStop(0.28, "#6e5d4a55");
	wornSand.addColorStop(0.68, "#7b69547a");
	wornSand.addColorStop(1, "#52443800");
	stroke(ctx, `${upperTrail}${lowerTrail}`, wornSand, 12);
}

function drawTrail(ctx: CanvasRenderingContext2D) {
	const sand = ctx.createLinearGradient(0, 267, 0, 361);
	sand.addColorStop(0, "#61514200");
	sand.addColorStop(0.16, "#74634fd2");
	sand.addColorStop(0.47, "#695a46bf");
	sand.addColorStop(0.72, "#786752bd");
	sand.addColorStop(1, "#53453812");
	ctx.lineCap = "round";
	ctx.filter = "blur(0.8px)";
	stroke(ctx, upperTrail, sand, 4.2);
	stroke(ctx, `M684 329${lowerTrail}`, sand, 7.6);
}

const ledgeRim = `L489 408 502 402 520 397 535 392 570 383 584 382
	606 369 625 364 648 358 682 355 711 353 732 350 751 349 773 344
	802 340 831 341 853 343 880 342 906 344 926 349 944 355 971 366 996 380 1008 401`;
const ledgeOutline = `M438 495Q451 453 474 421${ledgeRim}
	l-12 25-34 28-52 26-82 20H438Z`;

function drawLedgeBase(ctx: CanvasRenderingContext2D) {
	const stone = ctx.createLinearGradient(0, 355, 25, 501);
	stone.addColorStop(0, "#3a312a");
	stone.addColorStop(0.59, "#302820");
	stone.addColorStop(1, "#151311");
	fill(ctx, ledgeOutline, stone);
}

function drawLedgeTop(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(ledgeOutline));
	const top = ctx.createLinearGradient(684, 346, 710, 480);
	top.addColorStop(0, "#443b32");
	top.addColorStop(0.45, "#373028");
	top.addColorStop(0.79, "#302922");
	top.addColorStop(1, "#2d261f");
	const surface = new Path2D(
		`M474 421${ledgeRim}
		l-22 23-40 19-56 15-53 16-66 11-51-3-19-6-42-1-16-9-34-9-37 2-24-8-20 1-31-13-14 4-23-7Z`,
	);
	ctx.fillStyle = top;
	ctx.fill(surface);
	ctx.clip(surface);

	for (const [x, y, width, height] of [
		[735, 455, 150, 23],
		[931, 393, 61, 36],
	]) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(width, height);
		const light = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
		light.addColorStop(0, "#72625270");
		light.addColorStop(1, "#72625200");
		ctx.fillStyle = light;
		ctx.fillRect(-1, -1, 2, 2);
		ctx.restore();
	}
}

function drawLedgeFaces(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(ledgeOutline));
	const face = ctx.createLinearGradient(525, 401, 542, 495);
	face.addColorStop(0, "#4d4136");
	face.addColorStop(0.47, "#382f28");
	face.addColorStop(1, "#211a1500");
	fill(
		ctx,
		`M438 489l25-53 13-17 17-11 18 3-10 16-11 5-15 27-21 26Z
		M472 500l37-65 16-13 32 1-17 13-17 22-21 39Z
		M522 500l22-45 21-21 35-7 28 7-22 11-17 7-12 15-19 30Z
		M628 500l12-30 28-15 42 1 18 9-25-1-30 10-20 23Z`,
		face,
	);
	fill(
		ctx,
		`M495 415l16-3 11 3-20 21-23 41-14 17 11-31 15-30Z
		M555 421l17-1 9 5-18 8-19 17-20 43-13 7 18-46 13-17Z
		M618 445l32 2 16 7-26 14-16 32-10-2 10-27 17-14Z
		M756 480l-25 7-29 0-14 13h-18l24-19 28-7Z`,
		"#1f191590",
	);
}

function drawLedgeWeathering(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(ledgeOutline));
	fillTerrainContours(ctx, ledgeFaces);
}

function drawLedgeCrown(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(ledgeOutline));
	ctx.filter = "blur(0.95px)";
	const sandstone = ctx.createLinearGradient(0, 340, 0, 391);
	sandstone.addColorStop(0, "#9e887162");
	sandstone.addColorStop(0.48, "#7b685571");
	sandstone.addColorStop(1, "#51433700");
	fill(
		ctx,
		`M644 359q27-5 59-5l33-6 21 0 23-8 37-1 23 3-22 1-22 6-19 8-33 5-34 2-32 3-20-1Z
		M858 343l20-2 29 2 23 6 17 6 23 5 23 14-24-8-28-5-20-7-19-3-16-1-22-1Z`,
		sandstone,
	);
}

function drawForegroundWashes(ctx: CanvasRenderingContext2D) {
	ctx.filter = "blur(2px)";
	const sand = ctx.createLinearGradient(0, 347, 0, 438);
	sand.addColorStop(0, "#53473828");
	sand.addColorStop(0.49, "#69584757");
	sand.addColorStop(0.8, "#5045373a");
	sand.addColorStop(1, "#4a3c2e00");
	fill(
		ctx,
		`M0 351q58-7 114-2l24 5-28-1q-60-3-110 2Z
		M133 363q60-9 114-3 26 3 57-2l-14 5q-26 5-45 2-52-5-112 1Z
		M14 370q37-6 80-1l56 4-8 2-53-2q-38-4-75 0Z
		M201 382q54-8 109-1l42-6-14 5-31 5q-58-6-102 1Z
		M0 384q47-4 85 3l20 3-20 0q-45-5-85-2Z
		M20 397q49-7 107 2 44 7 94-1l-11 4q-45 8-88 1-52-8-102-2Z
		M229 405q42-11 87-5 39 4 75-6l-12 6q-35 10-68 5-47-6-82 4Z
		M386 391q40-4 77-13 28-5 64 1l-11 3q-30-4-53 1-36 10-77 11Z
		M336 426q38-4 80-1l27-4-7 4q-24 7-45 4-27-4-55 0Z`,
		sand,
	);
	fill(
		ctx,
		`M11 376q58-5 94 2l47 2-34 3-34-3q-37-3-73 1Z
		M153 407l43 3 33-5-11 6-31 4-34-4Z
		M339 393q31 3 60-2l34-7-12 5-25 7-39 2Z`,
		"#17131088",
	);
}

const fieldRockLayers = [
	rockLayer("field-west-cluster", "Cluster at the west edge", [
		"cluster",
		7,
		466,
		0.72,
	]),
	{
		id: "field-west-slab",
		label: "Slab below the west boulder",
		group: "Small rocks",
		draw: (ctx: CanvasRenderingContext2D) =>
			drawStratifiedBoulder(ctx, westFieldFragment),
	},
	{
		id: "field-ledge-slab",
		label: "Slab at the foot of the ledge",
		group: "Small rocks",
		draw: (ctx: CanvasRenderingContext2D) =>
			drawStratifiedBoulder(ctx, eastFieldFragment),
	},
	rockLayer("field-valley-slab", "Slab on the valley floor", [
		"slab",
		231,
		398,
		0.39,
	]),
	rockLayer("field-trail-cluster", "Cluster below the trail", [
		"cluster",
		499,
		366,
		0.32,
	]),
	rockLayer("field-east-boulder", "Boulder above the ledge", [
		"boulder",
		934,
		360,
		0.57,
	]),
] as const;

export const fieldNotesTerrainLayers = [
	{
		id: "distant-cliff-bench",
		label: "Distant cliff bench",
		draw: drawDistantCliffBench,
	},
	{ id: "escarpment", label: "Cliffs and valley", draw: drawEscarpment },
	{ id: "cliff-shadow", label: "Cliff wall shadows", draw: drawCliffShadows },
	{ id: "cliff-faces", label: "Western cliff faces", draw: drawCliffFaces },
	...cliffReliefLayers,
	{ id: "valley-folds", label: "Valley folds", draw: drawValleyFolds },
	{
		id: "valley-rill",
		label: "Worn channel across the valley",
		draw: drawValleyRill,
	},
	{ id: "valley-ridge", label: "Low valley ridge", draw: drawValleyRidge },
	{
		id: "foreground-washes",
		label: "Foreground washes",
		draw: drawForegroundWashes,
	},
] as const;

export const fieldNotesLayers = [
	{
		id: "lookout-rise",
		label: "Lookout rise",
		draw: drawLookoutRise,
		detail: lookoutDither,
	},
	...lookoutSlopeLayers.map((layer) => ({ ...layer, detail: lookoutDither })),
	...lookoutSlopeRocks.map((layer) => ({ ...layer, detail: lookoutDither })),
	{ id: "trail-shoulders", label: "Trail shoulders", draw: drawTrailShoulders },
	{ id: "trail", label: "Winding trail", draw: drawTrail },
	...lookoutLayers.map((layer) => ({ ...layer, detail: lookoutDither })),
	ledgeScrubLayer,
	{
		id: "ledge",
		label: "Ledge body",
		group: "Notebook ledge",
		draw: drawLedgeBase,
	},
	{
		id: "ledge-top",
		label: "Upper sandstone shelf",
		group: "Notebook ledge",
		draw: drawLedgeTop,
	},
	{
		id: "ledge-faces",
		label: "Fractured ledge faces",
		group: "Notebook ledge",
		draw: drawLedgeFaces,
	},
	{
		id: "ledge-weathering",
		label: "Weathered ledge highlights",
		group: "Notebook ledge",
		draw: drawLedgeWeathering,
	},
	{
		id: "ledge-crown",
		label: "Lit ledge rim behind the notebook",
		group: "Notebook ledge",
		draw: drawLedgeCrown,
	},
	{
		id: "west-boulder",
		label: "West foreground boulder",
		draw: (ctx: CanvasRenderingContext2D) =>
			drawStratifiedBoulder(ctx, westFieldBoulder),
	},
	{
		id: "middle-boulder",
		label: "Middle foreground boulder",
		draw: (ctx: CanvasRenderingContext2D) =>
			drawStratifiedBoulder(ctx, middleFieldBoulder),
	},
	{
		id: "east-boulder",
		label: "East foreground boulder",
		draw: (ctx: CanvasRenderingContext2D) =>
			drawStratifiedBoulder(ctx, eastFieldBoulder),
	},
	...fieldRockLayers,
	...fieldNotesVegetationLayers,
	...notebookLayers,
] as const;
