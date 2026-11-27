import { yuccaLayer } from "./DesertDetails";
import type { Plant } from "./SceneScenery";

type ScrubStem = { root: number; lean: number; rise: number };

function drawScrub(
	ctx: CanvasRenderingContext2D,
	base: number,
	height: number,
	stems: readonly ScrubStem[],
	curveControl = 0,
) {
	const light = ctx.createLinearGradient(0, base, 0, base - height);
	light.addColorStop(0, "#1e2719");
	light.addColorStop(0.34, "#3e5035");
	light.addColorStop(0.68, "#657d56");
	light.addColorStop(1, "#879e72");
	ctx.strokeStyle = light;
	ctx.lineCap = "round";
	for (const [stem, { root, lean, rise }] of stems.entries()) {
		const xAt = (progress: number) =>
			root +
			lean * (progress ** 2 + 2 * curveControl * progress * (1 - progress));
		ctx.lineWidth = (stem % 3 ? 1.05 : 1.48) * Math.min(1, 0.35 + height / 78);
		ctx.beginPath();
		ctx.moveTo(root, base);
		ctx.quadraticCurveTo(
			root + lean * curveControl,
			base - rise / 2,
			xAt(1),
			base - rise,
		);
		for (let branch = 0; branch < 6; branch++) {
			const progress = 0.3 + 0.112 * branch + (stem % 3) * 0.014;
			const x = xAt(progress);
			const y = base - rise * progress;
			const direction = (stem + branch) % 2 ? -1 : 1;
			const length = rise * (0.19 - 0.013 * branch);
			ctx.moveTo(x, y);
			ctx.quadraticCurveTo(
				x + direction * length * 0.6,
				y - length * 0.2,
				x + direction * length * 0.74,
				y - length * 0.72,
			);
			if ((stem + branch) % 4 === 0) {
				ctx.moveTo(x + direction * length * 0.43, y - length * 0.28);
				ctx.lineTo(x + direction * length * 0.8, y - length * 0.43);
			}
		}
		ctx.stroke();
	}
}

function drawLedgeScrub(ctx: CanvasRenderingContext2D) {
	drawMappedScrub(
		ctx,
		947,
		365,
		92,
		[
			[855, 336],
			[863, 341],
			[867, 314],
			[873, 320],
			[879, 330],
			[882, 299],
			[888, 295],
			[893, 314],
			[902, 301],
			[907, 321],
			[916, 300],
			[920, 309],
			[925, 293],
			[927, 276],
			[934, 287],
			[937, 313],
			[942, 301],
			[946, 289],
			[953, 305],
			[959, 296],
			[966, 296],
			[974, 285],
			[978, 297],
			[984, 322],
			[990, 313],
			[995, 323],
			[997, 344],
		],
		0.54,
	);
}

function drawWestScrub(ctx: CanvasRenderingContext2D) {
	ctx.globalAlpha = 0.76;
	drawMappedScrub(
		ctx,
		39,
		476,
		49,
		[
			[5, 458],
			[9, 450],
			[14, 446],
			[18, 440],
			[22, 447],
			[24, 434],
			[29, 440],
			[34, 435],
			[39, 425],
			[42, 431],
			[46, 441],
			[49, 436],
			[52, 445],
			[56, 441],
			[60, 449],
			[65, 449],
			[69, 454],
			[73, 458],
			[79, 463],
		],
		0.4,
	);
}

function drawValleyScrub(ctx: CanvasRenderingContext2D) {
	drawMappedScrub(
		ctx,
		569,
		355,
		40,
		[
			[532, 345],
			[538, 337],
			[545, 343],
			[550, 330],
			[555, 334],
			[558, 324],
			[564, 329],
			[568, 316],
			[572, 321],
			[575, 333],
			[579, 322],
			[583, 332],
			[589, 327],
			[594, 337],
			[600, 334],
			[604, 340],
			[610, 346],
		],
		0.32,
	);
}

const foregroundStemTips = [
	[241, 439],
	[248, 425],
	[255, 429],
	[260, 422],
	[264, 414],
	[265, 403],
	[271, 411],
	[278, 395],
	[278, 401],
	[284, 407],
	[286, 384],
	[293, 388],
	[297, 402],
	[299, 391],
	[302, 409],
	[307, 398],
	[311, 372],
	[316, 390],
	[318, 409],
	[322, 392],
	[325, 408],
	[333, 386],
	[337, 378],
	[342, 393],
	[344, 407],
	[351, 396],
	[355, 410],
	[360, 392],
	[370, 401],
	[374, 415],
	[382, 410],
	[388, 427],
	[393, 424],
	[396, 435],
] as const;

function drawMappedScrub(
	ctx: CanvasRenderingContext2D,
	center: number,
	base: number,
	height: number,
	tips: readonly (readonly [number, number])[],
	curveControl = 0,
) {
	const stems = tips.map(([tipX, tipY]) => {
		const root = center + (tipX - center) * 0.32;
		return { root, lean: tipX - root, rise: base - tipY };
	});
	drawScrub(ctx, base, height, stems, curveControl);
}

function drawForegroundScrub(ctx: CanvasRenderingContext2D) {
	drawMappedScrub(ctx, 313, 451, 83, foregroundStemTips, 0.28);
}

export const fieldNotesPlants = [
	{
		id: "plant-cactus",
		label: "Foreground cactus",
		kind: "cactus",
		x: 12,
		y: 72,
		width: 6,
		silhouette: "workshop",
	},
	{
		id: "plant-far-cactus",
		label: "Distant cactus",
		kind: "cactus",
		far: true,
		x: 27.9,
		y: 63.2,
		width: 2.05,
		silhouette: "workshop",
	},
	{
		id: "plant-cactus-grass",
		label: "Grass beside the cactus",
		kind: "grass",
		variant: "sparse",
		x: 7.3,
		y: 71.3,
		width: 2.4,
	},
	{
		id: "plant-west-grass",
		label: "Grass above the west boulder",
		kind: "grass",
		variant: "leaning",
		x: 4.15,
		y: 76.3,
		width: 2.6,
	},
	{
		id: "plant-valley-fan",
		label: "Fan grass on the valley floor",
		kind: "grass",
		variant: "fan",
		x: 44,
		y: 78.2,
		width: 3.3,
	},
	{
		id: "plant-valley-grass",
		label: "Grass on the valley bank",
		kind: "grass",
		variant: "leaning",
		x: 40,
		y: 71.6,
		width: 2.2,
	},
	{
		id: "plant-east-grass",
		label: "East valley grass",
		kind: "grass",
		variant: "sparse",
		x: 50.8,
		y: 68.2,
		width: 1.7,
	},
] satisfies readonly Plant[];

export const ledgeScrubLayer = {
	id: "ledge-scrub",
	label: "Scrub behind the ledge",
	draw: drawLedgeScrub,
} as const;

export const fieldNotesVegetationLayers = [
	yuccaLayer(
		"west-boulder-yucca",
		"Yucca beside the west boulder",
		[245, 482, 48, 31],
	),
	yuccaLayer("valley-yucca", "Yucca on the valley floor", [214, 400, 35, 20]),
	yuccaLayer("cactus-yucca", "Yucca beside the cactus", [164, 370, 31, 19]),
	yuccaLayer("ledge-yucca", "Yucca at the ledge", [423, 477, 65, 52]),
	{ id: "west-scrub", label: "Scrub beside west boulder", draw: drawWestScrub },
	{ id: "scrub", label: "Valley scrub", draw: drawValleyScrub },
	{
		id: "foreground-scrub",
		label: "Large foreground shrub",
		draw: drawForegroundScrub,
	},
] as const;
