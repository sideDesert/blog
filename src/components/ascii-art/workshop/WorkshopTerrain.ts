import { fill, fillTerrainContours } from "./canvasShapes";
import { rockLayer } from "./DesertDetails";
import {
	middleMesaFaces,
	twinSpireFaces,
	westernTablelandFaces,
} from "./distantRidgeFaces";
import {
	drawStratifiedBoulder,
	westWorkshopBoulder,
} from "./foregroundBoulders";
import { mesaFaces } from "./mesaFaces";
import { towerValleyContours } from "./towerValleyContours";

export const projectRidge = [
	[24, 225],
	[44, 221],
	[58, 210],
	[89, 208],
	[103, 194],
	[105, 184],
	[127, 170],
	[133, 153],
	[136, 130],
	[151, 125],
	[157, 122],
	[171, 123],
	[187, 125],
	[206, 121],
	[221, 120],
	[226, 118],
	[242, 119],
	[256, 125],
	[271, 132],
	[277, 135],
	[283, 141],
	[290, 143],
	[297, 147],
	[310, 146],
	[326, 147],
	[340, 158],
	[344, 175],
	[350, 196],
	[362, 205],
	[382, 214],
	[389, 223],
	[415, 225],
	[429, 222],
	[460, 220],
	[470, 223],
	[477, 246],
	[488, 250],
	[511, 251],
	[524, 250],
	[531, 242],
	[555, 241],
	[587, 241],
	[593, 245],
	[597, 258],
	[610, 261],
	[624, 268],
	[642, 272],
	[673, 277],
	[700, 282],
	[730, 280],
	[742, 277],
	[754, 272],
	[785, 272],
	[790, 278],
	[794, 285],
	[817, 292],
	[842, 295],
	[854, 289],
	[875, 291],
	[893, 283],
	[897, 271],
	[900, 258],
	[905, 257],
	[910, 275],
	[915, 273],
	[918, 257],
	[920, 246],
	[926, 245],
	[930, 262],
	[933, 274],
	[951, 285],
	[976, 289],
] as const;

const mesaSkyline = `M${projectRidge.join(" ")}`;

const leftFoothills = `
	M24 268 Q75 263 114 265 L136 261 153 256 177 257 186 248 197 247 202 255 213 262
	221 253 224 245 229 244 231 251 231 265 236 265 239 244 240 232 245 232 248 242 248 265 256 270
	259 252 263 251 267 274 284 278 307 289 325 295 Q274 296 227 307 Q184 303 144 312 Q89 319 24 306Z
`;

const towerKnoll = `
	M564 334 Q594 320 621 322 L632 316 650 315 664 317 701 317 707 325 725 330 Q746 336 772 348
	L794 355 805 349 816 351 826 356 839 361 861 360 876 365 Q930 366 977 374
	L976 411 Q913 397 835 404 Q785 386 721 389 Q639 352 564 353Z
`;

const foreground = `
	M21 374 Q109 367 198 395 Q275 411 332 409 Q411 406 496 414 Q564 407 648 408 Q691 408 746 383
	Q863 366 979 386 L976 445 Q920 456 867 455T751 464 Q688 467 621 465T490 476 Q410 469 343 475T210 462 Q115 467 24 448Z
`;

const terraceRills = `
	M67 215Q106 208 152 208T222 206Q245 202 271 207T332 213
	M103 192Q146 189 184 190T250 189Q276 189 292 200
	M122 183Q148 178 178 182T234 181L252 177 274 181 296 182 321 189
	M157 170Q183 172 215 168L241 169 258 177 281 178
	M258 213Q289 212 310 220T372 228Q389 231 409 229
	M281 227Q303 223 329 230T387 239L411 240
	M97 247Q158 243 205 246M269 249Q323 247 368 254T459 264
	M325 270Q399 263 449 272T538 282Q575 288 608 287
	M499 270Q544 271 574 278T659 291
	M637 286Q692 288 726 298T798 307Q846 310 895 301L935 291 972 294
	M777 315Q841 319 880 313T974 316
`;

const valleyRills = `
	M27 272Q91 266 143 281T229 301Q274 312 314 308
	M22 278Q81 282 129 293T218 316Q267 334 321 327
	M28 290Q95 299 151 313T248 345Q273 348 303 349
	M35 316Q89 318 138 333T237 360Q268 367 296 367
	M28 351Q87 340 154 359T275 389
	M285 281Q325 275 368 282Q467 286 513 304T611 323
	M551 353Q595 344 631 346Q690 349 744 373T848 386Q897 392 973 387
	M676 329Q725 336 768 355T869 370Q926 371 971 379
	M778 327Q822 340 871 334T975 339
	M799 347Q857 350 892 347T974 355
	M646 392Q698 388 746 397T858 399Q924 395 976 404
`;

const groundRills = `
	M26 395Q83 383 138 397T247 411Q294 416 337 409
	M36 406Q127 392 201 411T347 424Q406 426 473 415T602 422
	M25 420Q97 403 182 424T355 434Q408 439 459 428T557 429Q594 429 640 425
	M43 435Q101 420 169 435T289 445Q352 446 423 438
	M89 449Q144 440 202 451T321 453Q364 459 408 454
	M231 451Q299 452 367 449T503 452Q572 451 646 447T777 444
	M553 430Q617 432 683 419T803 417Q893 409 966 420
	M584 442Q671 448 744 433T877 430Q936 431 974 426
	M689 449Q761 449 827 442T977 442
	M241 469Q314 464 374 471T495 468Q567 462 635 465
`;

const mesas = `${mesaSkyline} L976 465
	Q901 477 815 475 T648 486 Q553 481 482 487 Q387 488 302 477
	Q209 480 129 468 Q67 469 24 460Z`;

function fillLandform(
	context: CanvasRenderingContext2D,
	path: string,
	top: number,
	bottom: number,
	topColor: string,
	bottomColor: string,
) {
	const gradient = context.createLinearGradient(0, top, 0, bottom);
	gradient.addColorStop(0, topColor);
	gradient.addColorStop(1, bottomColor);
	context.fillStyle = gradient;
	context.fill(new Path2D(path));
}

function markStone(
	context: CanvasRenderingContext2D,
	path: string,
	color: string,
	dashes: [number, number],
) {
	context.strokeStyle = color;
	context.setLineDash(dashes);
	context.stroke(new Path2D(path));
}

export function drawWorkshopTerrain(context: CanvasRenderingContext2D) {
	context.save();
	context.lineWidth = 1;
	context.lineJoin = "round";

	fillLandform(context, mesas, 120, 390, "#463b30", "#111");
	fillLandform(context, leftFoothills, 244, 319, "#34302a", "#171614");
	fillLandform(
		context,
		`M29 272q49-9 93 6l38 7-28 1q-62-13-103-10Z
		M105 288q51 3 83 15t74 14q-48 3-80-9t-77-16Z`,
		232,
		319,
		"#746452",
		"#30281f60",
	);
	fillLandform(context, towerKnoll, 315, 408, "#302a24", "#151412");
	fillLandform(context, foreground, 377, 474, "#2d2821", "#11111100");
	fillLandform(
		context,
		`
		M45 426q20-13 49-6 43 12 82 13-31 4-54-2-38-11-77 0Z
		M226 444q47-14 100-13t84 3q-46 7-88 6-47 1-96 10Z
		M673 441q46-12 78-10l57 8q-32 7-64 2-30-3-71 5Z
		M827 432q69-16 136-12l-34 5-51 11-55 2Z
	`,
		417,
		456,
		"#51453688",
		"#211b1600",
	);
	markStone(context, terraceRills, "#373027", [0.65, 4.2]);
	markStone(context, valleyRills, "#28251f", [0.75, 6.3]);
	markStone(context, groundRills, "#40372b", [0.8, 4.6]);

	context.globalCompositeOperation = "destination-out";
	const edges = context.createLinearGradient(0, 0, 1000, 0);
	edges.addColorStop(0, "#000");
	edges.addColorStop(0.024, "#0009");
	edges.addColorStop(0.057, "#0000");
	edges.addColorStop(0.943, "#0000");
	edges.addColorStop(0.976, "#0009");
	edges.addColorStop(1, "#000");
	context.fillStyle = edges;
	context.fillRect(0, 0, 1000, 500);
	const foot = context.createLinearGradient(0, 433, 0, 487);
	foot.addColorStop(0, "#0000");
	foot.addColorStop(0.43, "#0004");
	foot.addColorStop(1, "#000");
	context.fillStyle = foot;
	context.fillRect(0, 433, 1000, 67);
	context.restore();
}

export function drawMesaFaces(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(mesas));
	const wallShadow = ctx.createLinearGradient(0, 119, 0, 239);
	wallShadow.addColorStop(0, "#332922");
	wallShadow.addColorStop(0.52, "#191715");
	wallShadow.addColorStop(0.83, "#1b1815d0");
	wallShadow.addColorStop(1, "#211b1600");
	ctx.fillStyle = wallShadow;
	ctx.fillRect(24, 114, 390, 125);
	fillTerrainContours(ctx, mesaFaces);
}

export const mesaStrataLayers = (
	[
		[
			"mesa-crown",
			"Mesa crown",
			120,
			155,
			"#8b7a6650",
			"#88766168",
			`M132 141l4-13 22-6 21 1-10 4-16 1-9 4-5 10Z
			M186 125l34-5 22-1 16 5 15 8 13 9 7 7-11 4-10-9-16-10-16-7-20-2-20 3Z`,
		],
		[
			"mesa-shelf",
			"Mesa middle shelf",
			171,
			230,
			"#70604e40",
			"#88745c50",
			`M120 179q25-9 48-5l58-8 20 4-23 5-29 0-28 7-27-1-15 4Z
			M260 212l17-2 18 5 13 2 13 7-21 1-16-6-18-1Z
			M333 190l12 2 9 11 9 10 10 3-6 5-13-4-13-12Z`,
		],
		[
			"mesa-buttresses",
			"Mesa lower buttresses",
			222,
			280,
			"#78685427",
			"#4a3e3012",
			`M247 222l35 2 13 6-5 7 5 19-5 13-9-11-2-20-22-9Z
			M305 230l13 1 5 16 8 8 1 13-16-7-7-13Z
			M336 230l23 3 7 23 22 9 5 13-17-6-20-12-12-21Z
			M377 235l16 3 5 12 13 6 4 14-11-5-14-10Z`,
		],
		[
			"mesa-west-shadow",
			"Shadow below the west shelf",
			222,
			269,
			"#18151262",
			"#18151200",
			`M25 228q37-6 78-6l65 2 57-2 30 7-21 17-29 3-32 6-44 7-105 3Z`,
		],
	] as const
).map(([id, label, top, bottom, lit, shadow, faces]) => ({
	id,
	label,
	group: "Main mesa strata",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.clip(new Path2D(mesas));
		ctx.filter = "blur(0.9px)";
		fillLandform(ctx, faces, top, bottom, lit, shadow);
	},
}));

export const distantRidgeLayers = (
	[
		["western-tableland", "Western tableland faces", westernTablelandFaces],
		["middle-mesa", "Middle mesa faces", middleMesaFaces],
		["twin-spires", "Twin spire faces", twinSpireFaces],
	] as const
).map(([id, label, contours]) => ({
	id,
	label,
	group: "Distant ridge faces",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.clip(new Path2D(mesas));
		fillTerrainContours(ctx, contours);
	},
}));

export function drawTowerKnoll(ctx: CanvasRenderingContext2D) {
	fillLandform(
		ctx,
		`M568 335q43-13 64-15l18-4 51 1 6 7 22 8 29 13-24-5-30-10-11-6-37-1-21 4-24 5-34 5Z
		M685 325l20 2 11 7 23 9-18-4-16-6-16-2Z`,
		315,
		354,
		"#4a4033",
		"#302820",
	);
	fillLandform(
		ctx,
		`M593 330q16-9 35-10l10-2-6 5-23 2-13 6Z
		M671 319l9-2 19.5.1 4.5 6-4-.5-3-3-13-.4-10 1.5Z`,
		317,
		332,
		"#766651ae",
		"#45372b00",
	);
}

export function drawValleyBanks(context: CanvasRenderingContext2D) {
	fillLandform(
		context,
		"M375 253q49 1 92 13l56 18 62 18 66 7-21 6-50-6-57-16-65-21-46-9Z",
		253,
		333,
		"#493f34",
		"#2a241d",
	);
	fillLandform(
		context,
		`M568 354l62-15 44-2 33 7 49 19-34-6-24-8-28-3-29 3-40 9Z
		M767 372l30 3 39 12 52 5-24 4-33-3-35-14Z
		M839 331l31 1 39-10 63-6-26 12-39 5-45 9Z`,
		317,
		400,
		"#1b1713",
		"#241e1900",
	);
	fillTerrainContours(context, towerValleyContours);
}

export const westValleyLayers = (
	[
		[
			"west-valley-shadow",
			"Shadow beneath the valley bank",
			269,
			327,
			"#1b1714b0",
			"#15131100",
			`M23 274q32-10 58-1l39 9 26 9 51 14 47 11 59 1 34-2
			-26 10-39 2-45-4-49-13-54-17-45-10-42-1-14 5Z`,
		],
		[
			"west-valley-bank",
			"Lit edge of the valley bank",
			272,
			320,
			"#7a68517e",
			"#66554334",
			`M50 274q19-4 32-3l20 5 22 3 18 5 28 6 21 6 35 8 39 6 38 5 20 2
			-21 1-40-3-38-6-27-6-30-7-33-10-17-1-21-6-15-2-13-4Z`,
		],
		[
			"west-valley-rill",
			"Runoff below the west bank",
			285,
			331,
			"#66564075",
			"#44372b00",
			`M79 282q8 11 19 15 35 15 71 24l27 5-20 1-22-5-40-12
			q-35-10-39-27Z`,
		],
	] as const
).map(([id, label, top, bottom, near, far, form]) => ({
	id,
	label,
	group: "West valley bank",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.filter = "blur(0.9px)";
		fillLandform(ctx, form, top, bottom, near, far);
	},
}));

const hoodooLayers = (
	[
		[
			"west-foothill-butte",
			"West foothill butte",
			244,
			280,
			"M187 249l5-3 6 1 3 3 1 9 6 5-8-2-4-10-6 1-4 9-11 2Z",
			"M193 248l5-1 3 4 1 9 6 4-9-4-2-9-5-1Z",
		],
		[
			"west-foothill-needle",
			"West foothill needle",
			242,
			269,
			"M219 263l3-17 2-3 4 1 2 5 1 15 6 5-9-3-2-17-2-2-3 16Z",
			"M223 246l2-3 3 1 2 6 1 17-3-4-1-13-2-3Z",
		],
		[
			"main-foothill-spire",
			"Main foothill spire",
			229,
			289,
			`M236 263l1-25 3-7 4-1 5 4 2 24 4 11 16 13-16-6-12-10-4 7-15 10-9 3Z`,
			`M240 234l4-4 5 4 2 24 3 12-6-9-2-24-4-2Z
			M240 265l5-3 4 6 13 13-10-5-8-6-7 4-9 8-6 1Z`,
		],
		[
			"east-foothill-needle",
			"East foothill needle",
			250,
			288,
			"M255 267l2-16 3-1 4 4 1 17 8 8 12 8-13-5-10-9-3-18-2-1Z",
			"M259 251l2-1 3 4 1 17 5 8-7-7-1-16Z",
		],
	] as const
).map(([id, label, top, bottom, body, face]) => ({
	id,
	label,
	group: "West foothill spires",
	draw(ctx: CanvasRenderingContext2D) {
		fillLandform(ctx, body, top, bottom, "#65574660", "#342b2220");
		fillLandform(ctx, face, top, bottom, "#9c886e68", "#5b4a381c");
	},
}));

export const westHoodooLayers = [
	{
		id: "foothill-talus",
		label: "Sandstone slope below the spires",
		group: "West foothill spires",
		draw(ctx: CanvasRenderingContext2D) {
			ctx.filter = "blur(1.2px)";
			fillLandform(
				ctx,
				`M196 294q19-6 29-16l15-9 9-1 15 4 12 8 25 13
				-22-3-17-7-17-2-16 3-16 8-22 4Z
				M217 295l22-8 17 1 21 7 18 3-23-1-16-4-16-2-18 5Z`,
				268,
				300,
				"#74614a52",
				"#64503918",
			);
		},
	},
	...hoodooLayers,
] as const;

export function drawWorkshopForecourt(context: CanvasRenderingContext2D) {
	fillLandform(
		context,
		`M148 412q63-12 129-5 46 6 95 1 63-7 134 2 53 7 113 3 70-5 140 4
		l13 19q-86 3-144 7-77 1-141-5-70-9-126-4-50 8-111 4-42-6-99 8Z
		M224 447q62-14 115-6 40 8 94 4 66-8 146 4 49 6 101-4l-9 10q-54 12-108 6-60-10-126-5-58 6-112-3-47-8-99 2Z`,
		406,
		469,
		"#382e2599",
		"#28201900",
	);
}

export function drawForecourtRipples(ctx: CanvasRenderingContext2D) {
	ctx.filter = "blur(1.2px)";
	fillLandform(
		ctx,
		`M222 424q17-4 34-7l18 1-13 4q-21 3-38 5Z
		M268 425q34-7 74-5l20 2-25 1q-35-1-61 5Z
		M345 435q36-4 62-2 39 3 78 0l25 3q-56 4-106 1-36-2-58 1Z
		M480 440q47-5 76-3 37 1 65-4l-4 5q-36 4-74 3-37 1-61 2Z`,
		417,
		444,
		"#6b5c497a",
		"#5b4b3b44",
	);
}

export function drawTerraceFaces(context: CanvasRenderingContext2D) {
	context.clip(new Path2D(mesas));
	fillLandform(
		context,
		"M714 306l27-8 30 5 18 7 29 8-15 6-20-6-31-5-29 1Z",
		296,
		333,
		"#1813109e",
		"#1a151182",
	);
	fillLandform(
		context,
		"M710 307l24-9 31 4 19 7 25 2-18 4-27-9-30-4-17 6Z",
		296,
		327,
		"#70604e68",
		"#574a3b35",
	);
}

export function drawEasternTerrace(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(mesas));
	fillLandform(
		ctx,
		`M794 299q24-6 42 0t40 0q29 2 59-3 16-8 41-7l-3 7q-21-2-39 7-35 6-61 4-21 6-43-2-16-4-36 1Z`,
		289,
		315,
		"#181411a0",
		"#1713103d",
	);
	fillLandform(
		ctx,
		`M794 300q20-9 37-3 19 6 42 2l-5 4q-23 3-40-2-14-4-32 2Z
		M878 298q22 3 53-2l7-2-3 4q-26 6-56 3Z
		M940 294q15-7 35-7l-3 3q-16 0-29 6Z`,
		285,
		312,
		"#88755e7a",
		"#6c5b4870",
	);
}

export const eastRidgeLayers = (
	[
		[
			"east-ridge-west-spire",
			"West spire at the east ridge",
			256,
			291,
			"#87735c58",
			"#66523d16",
			"M896 278l3-18 3-3 3 1 2 7 1 11 9 11-11-4-5-12-2-6-2 12-5 10Z",
		],
		[
			"east-ridge-east-spire",
			"East spire at the east ridge",
			245,
			292,
			"#9b866b68",
			"#705a431b",
			"M913 277l5-15 1-12 3-5 5 1 3 8 1 14 8 14 6 6-10-3-8-10-3-18-2-5-1 3-3 14Z",
		],
		[
			"east-ridge-caps",
			"Lit caps on the eastern tablelands",
			271,
			290,
			"#84725c55",
			"#69564124",
			`M731 282l10-5 13-5 25-1 8 1 2 6 6 7-10-3-8-5-18 1-16 4Z
			M839 296l10-6 11-3 13 2 9 4-14-1-13 3-10 3Z`,
		],
		[
			"east-ridge-scarp",
			"Sunlit eastern escarpment",
			293,
			317,
			"#7c6a5070",
			"#6f59401e",
			`M748 293q22 0 43 5l12 4-25 1-13-4-16-3Z
			M816 300q28 5 48-3l19-6 13 0-17 8-21 8-24-1-16-3Z
			M885 304q20-7 39-8l18-6 16-1-14 6-19 7-18 3-19 3Z`,
		],
		[
			"east-ridge-lower-shelf",
			"Lower shelf on the east ridge",
			329,
			348,
			"#69574342",
			"#54433114",
			"M834 335q26 1 49-1l37-3 43-1-17 4-28 1-33 5-35-2Z",
		],
		[
			"east-valley-shadow",
			"Shade across the eastern valley floor",
			371,
			408,
			"#1b171398",
			"#1b171300",
			`M706 376q32-8 81-2l71 2 56 1 61-1v27l-61-7-54 5-62-8-68-2Z`,
		],
	] as const
).map(([id, label, top, bottom, light, shade, face]) => ({
	id,
	label,
	group: "Eastern ridge and valley",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.clip(new Path2D(mesas));
		ctx.filter = "blur(0.85px)";
		fillLandform(ctx, face, top, bottom, light, shade);
	},
}));

export const workshopRockLayers = [
	rockLayer("west-slab", "Slab below the west boulder", [
		"slab",
		39,
		410,
		0.57,
	]),
	rockLayer("west-cluster", "Cluster beside the west boulder", [
		"cluster",
		94,
		410,
		0.75,
	]),
	rockLayer("cactus-slab", "Slab below the cactus", ["slab", 124, 428, 0.42]),
	rockLayer("lean-to-slab", "Slab by the lean-to", ["slab", 231, 421, 0.35]),
	rockLayer("yard-cluster", "Cluster west of the yard boulder", [
		"cluster",
		291,
		438,
		0.7,
	]),
	rockLayer("yard-boulder", "Yard boulder", ["boulder", 308, 433, 0.96]),
	rockLayer("bench-cluster", "Cluster in front of the bench", [
		"cluster",
		345,
		445,
		0.51,
	]),
	rockLayer("forecourt-west-chip", "West chip in the forecourt", [
		"slab",
		261,
		460,
		0.25,
	]),
	rockLayer("forecourt-middle-chip", "Middle chip in the forecourt", [
		"boulder",
		407,
		459,
		0.29,
	]),
	rockLayer("forecourt-east-chip", "East chip in the forecourt", [
		"boulder",
		465,
		457,
		0.3,
	]),
	rockLayer("east-slab", "Slab below the east boulder", [
		"slab",
		840,
		441,
		0.35,
	]),
	rockLayer("ridge-slab", "Slab by the east ridge", ["slab", 883, 418, 0.42]),
] as const;

export function drawWestBoulder(ctx: CanvasRenderingContext2D) {
	drawStratifiedBoulder(ctx, westWorkshopBoulder);
}

export const workshopPebbleLayers = (
	[
		["west-pebbles", "Pebbles around the cactus", 29, 421, 210, 38, 44],
		["yard-pebbles", "Pebbles by the lean-to", 251, 446, 213, 18, 46],
		["bench-pebbles", "Pebbles in front of the bench", 440, 448, 180, 14, 25],
		[
			"knoll-pebbles",
			"Pebbles at the foot of the knoll",
			709,
			429,
			140,
			38,
			41,
		],
		["east-pebbles", "Pebbles by the east ridge", 851, 420, 98, 20, 20],
	] as const
).map(([id, label, left, top, width, depth, count]) => ({
	id,
	label,
	group: "Pebble patches",
	draw(ctx: CanvasRenderingContext2D) {
		for (let pebble = 0; pebble < count; pebble++) {
			const x = left + ((pebble * 139) % width);
			const y = top + ((pebble * 73 + left) % depth);
			const size = 0.8 + (pebble % 7) * 0.22;
			fill(
				ctx,
				`M${x} ${y}l${size} -1 ${size} .65-.4 .75Z`,
				pebble % 4 ? "#43392e" : "#6a5b49",
			);
		}
	},
}));
