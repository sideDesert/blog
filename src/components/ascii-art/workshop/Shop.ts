import { fabricInk, flameInk, hempInk, metalInk, woodInk } from "./materialInk";
import { awningContours } from "./awningContours";
import { fill, fillTerrainContours, stroke } from "./canvasShapes";

function drawCrate(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
) {
	ctx.save();
	ctx.translate(x, y);
	const depth = Math.min(3, width * 0.2);
	const rail = Math.min(1.5, width * 0.14);
	const wood = ctx.createLinearGradient(0, 0, 0, height);
	wood.addColorStop(0, woodInk("#5a4b3c"));
	wood.addColorStop(1, woodInk("#30271f"));
	fill(ctx, `M0 2h${width}v${height - 2}H0Z`, wood);
	fill(ctx, `M0 2l${depth}-2h${width}l-${depth} 2Z`, woodInk("#72614d"));
	fill(
		ctx,
		`M${width} 2l${depth}-2v${height - 2}l-${depth} 2Z`,
		woodInk("#282019"),
	);
	fill(
		ctx,
		`M${rail} 4h${width - rail * 2}v${height - 6}H${rail}Z`,
		woodInk("#403227"),
	);
	fill(
		ctx,
		`M0 2h${rail}v${height - 2}H0Z
		M${width - rail} 2h${rail}v${height - 2}h-${rail}Z
		M0 ${height - 1.5}h${width}v1.5H0Z`,
		woodInk("#6c5b48"),
	);
	if (height > 12) {
		fill(
			ctx,
			`M2 6h${width - 4}v1.2H2Zm0 5h${width - 4}v.8H2Z`,
			woodInk("#584838"),
		);
		fill(ctx, `M${width / 2 - 2} 5h4v2.2h-4Z`, woodInk("#88745b"));
	}
	ctx.restore();
}

function crateLayers<Id extends string>(
	prefix: Id,
	group: string,
	name: string,
	placements: readonly (readonly [number, number, number, number])[],
	opacity = 1,
) {
	return placements.map(([x, y, width, height], index) => ({
		id: `${prefix}-${index + 1}` as const,
		label: `${name} ${index + 1}`,
		group,
		draw(ctx: CanvasRenderingContext2D) {
			ctx.globalAlpha *= opacity;
			drawCrate(ctx, x, y, width, height);
		},
	}));
}

const shelfBoxes = crateLayers(
	"shelf-box",
	"Shelf stock",
	"Shelf box",
	[
		[343, 347, 5, 8],
		[350, 345, 6.5, 10],
		[365, 346, 7, 9],
		[350, 368, 7, 11],
		[359, 371, 6.5, 8],
		[367, 367, 6.5, 12],
		[351, 392, 10, 13],
		[366, 391, 8, 14],
	],
	0.51,
);

const shelfTins = [
	[357, 342, 5.5, 13],
	[371, 348, 3.3, 7],
	[345, 370, 4.5, 9],
	[358, 366, 4, 13],
	[370, 372, 5, 7],
].map(([x, y, width, height], index) => ({
	id: `shelf-tin-${index + 1}` as const,
	label: `Shelf tin ${index + 1}`,
	group: "Shelf stock",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.globalAlpha *= 0.51;
		fill(
			ctx,
			`M${x} ${y + 1}q${width / 2}-2 ${width} 0v${height - 1}h-${width}Z`,
			metalInk("#5e5040"),
		);
		fill(
			ctx,
			`M${x + 0.6} ${y + 1}h.9v${height - 1}h-.9Z`,
			metalInk("#796851"),
		);
	},
}));

export const shelfStockLayers = [...shelfBoxes, ...shelfTins];

export function drawWorkbenchShadow(ctx: CanvasRenderingContext2D) {
	for (const [x, y, radius, depth, opacity] of [
		[478, 408, 63, 0.12, 0.65],
		[424, 411, 13, 0.19, 1],
		[441, 412, 18, 0.19, 1],
		[491, 411.5, 30, 0.19, 1],
		[526, 411, 13, 0.19, 1],
	]) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1, depth);
		ctx.globalAlpha *= opacity;
		const contact = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
		contact.addColorStop(0, "#14110dbb");
		contact.addColorStop(0.38, "#17130f71");
		contact.addColorStop(1, "#17130f00");
		ctx.fillStyle = contact;
		ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
		ctx.restore();
	}
}

const benchContainers = [
	[430, 4, 4],
	[437.5, 8.5, 4.2],
	[443.7, 10.5, 4.3],
	[450, 6, 3.2],
	[458, 5.5, 4.3],
	[465.5, 10.6, 4.4],
	[471.8, 7.5, 4.2],
	[478.7, 10, 4.8],
	[486, 7.5, 4],
	[519.5, 8.7, 4.5],
] as const;

export const benchSupplyLayers = benchContainers.map(
	([x, height, width], index) => ({
		id: `bench-container-${index + 1}` as const,
		label: `Workbench container ${index + 1}`,
		group: "Workbench supplies",
		draw(ctx: CanvasRenderingContext2D) {
			const base = 381;
			const top = base - height;
			const neck = width * 0.25;
			const left = x - width / 2;
			const right = x + width / 2;
			const shoulder = Math.min(height * 0.29, 2.4);
			const glassInk = [fabricInk, hempInk, metalInk][index % 3];
			const glass = ctx.createLinearGradient(left, 0, right, 0);
			glass.addColorStop(0, glassInk("#534636"));
			glass.addColorStop(0.38, glassInk("#89765d"));
			glass.addColorStop(1, glassInk("#473c2f"));
			fill(
				ctx,
				`M${left} ${base}V${top + shoulder}l${width / 2 - neck} -${shoulder}h${2 * neck}L${right} ${top + shoulder}V${base}Z`,
				glass,
			);
			fill(
				ctx,
				`M${x - neck} ${top}h${2 * neck}v1.2h-${2 * neck}Z`,
				metalInk("#aa9779"),
			);
		},
	}),
);

const toolHeads = {
	openWrench:
		"M-.45-1h.9v.8Q2.3 0 2.2 3.3h-.9L.75 1.45h-1.5l-.55 1.85h-.9Q-2.3 0-.45-.2Z",
	ringWrench:
		"M0-.5a1.8 2.1 0 1 0 0 4.2 1.8 2.1 0 1 0 0-4.2Zm0 .92a.85 1.18 0 1 1 0 2.36.85 1.18 0 1 1 0-2.36Z",
	pliers: "M-.45-.8h.9v.6l1.2 1.5.5 2.4h-.95l-1.2-2-1.2 2h-.95l.5-2.4 1.2-1.5Z",
	hammer: "M-.5-1h1v1l1.95.4v2.1h-1l-.45-.8-3 .25V.2L-.5 0Z",
	driver: "M-.45-1h.9v1.2l.6.75v3q-1.05 1-2.1 0v-3l.6-.75Z",
};

const hangingTools = [
	["left-ring-wrench", "Left ring wrench", 394.3, 18, "ringWrench", 1.3],
	["long-driver", "Long screwdriver", 400.8, 19.3, "driver", 1.14],
	[
		"large-open-wrench",
		"Large open-ended wrench",
		407.2,
		15.2,
		"openWrench",
		1.35,
	],
	[
		"medium-open-wrench",
		"Medium open-ended wrench",
		413.3,
		16.6,
		"openWrench",
		1.43,
	],
	["center-driver", "Center screwdriver", 419.8, 15.6, "driver", 1.2],
	[
		"small-open-wrench",
		"Small open-ended wrench",
		425.9,
		16.3,
		"openWrench",
		1.35,
	],
	["long-pliers", "Long pliers", 432.5, 15.4, "pliers", 1.55],
	["stubby-wrench", "Stubby open-ended wrench", 439.2, 13.7, "openWrench", 1.6],
	["right-ring-wrench", "Right ring wrench", 446, 15.4, "ringWrench", 1.55],
	["short-pliers", "Short pliers", 451.8, 16.3, "pliers", 1.32],
	["short-driver", "Short screwdriver", 458.3, 15, "driver", 1.27],
	[
		"wrench-by-lamp",
		"Open-ended wrench by the lamp",
		465.4,
		18.1,
		"openWrench",
		1.35,
	],
	["hammer", "Hammer", 503.5, 15, "hammer", 1.65],
] as const;

export function drawToolRack(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M389 337.6h119v1.3H389Z", metalInk("#392f25"));
}

export const hangingToolLayers = hangingTools.map(
	([id, label, x, length, head, width]) => ({
		id,
		label,
		group: "Hanging tools",
		draw(ctx: CanvasRenderingContext2D) {
			const y = 339;
			fill(ctx, `M${x - 0.8} ${y - 0.8}h1.6v2h-1.6Z`, metalInk("#62574a"));
			const handle = ctx.createLinearGradient(0, y, 0, y + length);
			handle.addColorStop(0, metalInk("#594e42"));
			handle.addColorStop(0.58, metalInk("#685a4b"));
			handle.addColorStop(1, metalInk("#796b58"));
			fill(
				ctx,
				`M${x - width / 2} ${y}h${width}l.1 ${length}h-${width + 0.2}Z`,
				handle,
			);
			ctx.translate(x, y + length);
			const metal = ctx.createLinearGradient(-2, 0, 2.2, 2.5);
			metal.addColorStop(0, metalInk("#8d7e69"));
			metal.addColorStop(0.35, metalInk("#857660"));
			metal.addColorStop(1, metalInk("#726350"));
			ctx.fillStyle = metal;
			ctx.fill(new Path2D(toolHeads[head]), "evenodd");
		},
	}),
);

export function drawShopLightSpill(
	ctx: CanvasRenderingContext2D,
	brightness = 1,
) {
	ctx.globalAlpha = brightness;
	for (const [x, y, radius, depth, center, middle] of [
		[471, 419, 129, 0.15, "#c8ae87bf", "#bda27a49"],
		[384, 420, 77, 0.15, "#bea27d40", "#ad926930"],
		[558, 419, 65, 0.16, "#bea47d4f", "#b1966725"],
		[479, 432, 137, 0.14, "#aa8f6746", "#a88d6327"],
		[609, 421, 64, 0.132, "#b79b7448", "#ad926b27"],
	] as const) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1, depth);
		const spill = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
		spill.addColorStop(0, center);
		spill.addColorStop(0.48, middle);
		spill.addColorStop(1, "#ae936b00");
		ctx.fillStyle = spill;
		ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
		ctx.restore();
	}
}

export function drawLamplight(ctx: CanvasRenderingContext2D, brightness = 1) {
	ctx.globalAlpha = brightness;
	ctx.clip(
		new Path2D("M454 339q17 2 35 0q10 17 28 29-47 12-94 0 22-17 31-29Z"),
	);
	ctx.translate(471, 339);
	ctx.scale(1, 0.58);
	const glow = ctx.createRadialGradient(0, 0, 1, 0, 10, 58);
	glow.addColorStop(0, flameInk("#d4b99295"));
	glow.addColorStop(0.22, flameInk("#ccb08a5c"));
	glow.addColorStop(0.57, flameInk("#b99d7541"));
	glow.addColorStop(1, flameInk("#ad906800"));
	ctx.fillStyle = glow;
	ctx.fillRect(-62, 0, 124, 70);
}

export function drawLampMount(ctx: CanvasRenderingContext2D) {
	stroke(ctx, "M471 313v9", metalInk("#86745e"), 1.2);
	fill(ctx, "M469 322h4.2l1.7 5.3-7.7.2Z", metalInk("#80705a"));
}

export function drawLampShade(ctx: CanvasRenderingContext2D) {
	const shade = ctx.createRadialGradient(469, 327, 1, 471, 335, 20);
	shade.addColorStop(0, metalInk("#73624e"));
	shade.addColorStop(0.35, metalInk("#635443"));
	shade.addColorStop(0.73, metalInk("#514437"));
	shade.addColorStop(1, metalInk("#3d3329"));
	fill(ctx, "M467 327q4-2 9 0 10 3 14 11-18 1-36 0 5-8 13-11Z", shade);
	fill(ctx, "M457 334q5-5 11-7h7q-12 3-15 7Z", metalInk("#8c7a645f"));
}

export function drawLampRim(ctx: CanvasRenderingContext2D, brightness = 1) {
	ctx.globalAlpha = 0.28 + brightness * 0.72;
	const rim = ctx.createLinearGradient(454, 0, 490, 0);
	rim.addColorStop(0, flameInk("#aa9176"));
	rim.addColorStop(0.22, flameInk("#ead3b4"));
	rim.addColorStop(0.5, flameInk("#fff0d7"));
	rim.addColorStop(0.78, flameInk("#e6cba7"));
	rim.addColorStop(1, flameInk("#9b8268"));
	fill(ctx, "M454 337.5q16-1.2 36 0l-1 2q-18 1.5-34 0Z", rim);
}

export function drawLampBulb(ctx: CanvasRenderingContext2D, brightness = 1) {
	ctx.globalAlpha = 0.19 + brightness * 0.81;
	fill(
		ctx,
		"M467.7 336.4q3.8-.9 7.6 0l-.6 3.6q-3.3 1.1-6.7 0Z",
		flameInk("#fff7e8"),
	);
}

function drawAwningFrontPost(ctx: CanvasRenderingContext2D) {
	const timber = ctx.createLinearGradient(642.8, 0, 646.1, 0);
	timber.addColorStop(0, woodInk("#504437"));
	timber.addColorStop(0.43, woodInk("#7c6b55"));
	timber.addColorStop(1, woodInk("#4e4134"));
	fill(ctx, "M642.8 340h3.1v67h-3.1Z", timber);
	fill(ctx, "M640 406l2.4-3.4 5 1 2.8 5.4H640Z", woodInk("#786751"));
}

function drawAwningGuyLine(ctx: CanvasRenderingContext2D) {
	const rope = ctx.createLinearGradient(645, 343, 674, 406);
	rope.addColorStop(0, hempInk("#756857"));
	rope.addColorStop(0.65, hempInk("#685b4b"));
	rope.addColorStop(1, hempInk("#827059"));
	stroke(ctx, "M645 343c6 21 16 43 28 63", rope, 1.15);
	fill(ctx, "M662 391l2-1 2.6 5-2 1Z", hempInk("#88765e"));
}

const awningOutline =
	"M555 325C572 345 594 352 615 349Q632 348 645 343C631 354 612 363 597 364C578 365 564 350 555 325Z";

function swayAwning(ctx: CanvasRenderingContext2D, seconds: number) {
	const stretch = Math.sin(seconds * 1.38) * 0.085;
	// Stretch below the line joining the attachments so neither tie point moves.
	const slope = (343 - 325) / (645 - 555);
	ctx.transform(
		1,
		-slope * stretch,
		0,
		1 + stretch,
		0,
		stretch * (slope * 555 - 325),
	);
}

function drawAwning(ctx: CanvasRenderingContext2D, seconds = 0) {
	swayAwning(ctx, seconds);
	const fabric = ctx.createLinearGradient(582, 337, 596, 365);
	fabric.addColorStop(0, fabricInk("#685b4a"));
	fabric.addColorStop(0.6, fabricInk("#5d503f"));
	fabric.addColorStop(1, fabricInk("#44382d"));
	fill(ctx, awningOutline, fabric);
}

function drawAwningFolds(ctx: CanvasRenderingContext2D, seconds = 0) {
	swayAwning(ctx, seconds);
	ctx.clip(new Path2D(awningOutline));
	fillTerrainContours(ctx, awningContours, fabricInk);
	const fold = ctx.createLinearGradient(562, 334, 626, 360);
	fold.addColorStop(0, fabricInk("#55453318"));
	fold.addColorStop(0.35, fabricInk("#4e403365"));
	fold.addColorStop(0.71, fabricInk("#4a3c3050"));
	fold.addColorStop(1, fabricInk("#33281e00"));
	fill(
		ctx,
		`M559 330q12 12 24 15l10 1-5 2-10-1-9-5Z
		M577 346q21 9 50 3l-14 6-18 1-10-2Z
		M581 357q13 3 28 2l18-4-13 7-16 2-10-1Z`,
		fold,
	);
}

function drawAwningHem(ctx: CanvasRenderingContext2D, seconds = 0) {
	swayAwning(ctx, seconds);
	ctx.clip(new Path2D(awningOutline));
	const hem = ctx.createLinearGradient(556, 327, 645, 350);
	hem.addColorStop(0, fabricInk("#96826b74"));
	hem.addColorStop(0.46, fabricInk("#9481699a"));
	hem.addColorStop(1, fabricInk("#84705757"));
	fill(
		ctx,
		`M555 325q33 36 90 18l-4 3q-46 16-79-12Z
		M566 346c22 27 48 17 72 2l-4 4c-26 16-49 20-67-3Z`,
		hem,
	);
}

const awningMotion = {
	x: 551,
	y: 320,
	width: 98,
	height: 51,
	trigger: "frame",
} as const;
export const lampMotion = {
	x: 304,
	y: 333,
	width: 372,
	height: 123,
	trigger: "flicker",
} as const;

export const awningLayers = (
	[
		["awning-front-post", "Awning front post", drawAwningFrontPost],
		[
			"awning-inner-post",
			"Awning inner post",
			(ctx: CanvasRenderingContext2D) =>
				fill(ctx, "M565 351h2v48h-2Z", woodInk("#514538")),
		],
		[
			"awning-rear-post",
			"Awning rear post",
			(ctx: CanvasRenderingContext2D) =>
				fill(ctx, "M613 341h2v47h-2Z", woodInk("#514538")),
		],
		["awning-guy-line", "Awning guy line", drawAwningGuyLine],
		[
			"awning-anchor",
			"Awning ground anchor",
			(ctx: CanvasRenderingContext2D) =>
				fill(ctx, "M670 407l3-2 3 2-4 1Z", "#82715b"),
		],
		["awning", "Cloth awning", drawAwning, [awningMotion, lampMotion]],
		[
			"awning-folds",
			"Shaded folds in the awning",
			drawAwningFolds,
			[awningMotion, lampMotion],
		],
		[
			"awning-hem",
			"Lit edge of the awning",
			drawAwningHem,
			[awningMotion, lampMotion],
		],
	] as const
).map(([id, label, draw, motion]) => ({
	id,
	label,
	draw,
	motion,
	group: "Awning",
}));

export function drawHangingRope(ctx: CanvasRenderingContext2D) {
	stroke(
		ctx,
		"M519 340c-4-3-10 1-11 8-2 6 0 10 6 10s9-7 7-13Z",
		hempInk("#4a3d30"),
		3.2,
	);
	ctx.setLineDash([1.3, 0.75, 0.6, 0.8]);
	stroke(
		ctx,
		"M517 340c-4 0-8 5-8 10s2 8 7 7 7-8 4-13Z",
		hempInk("#8f7c63"),
		1.7,
	);
	ctx.setLineDash([]);
	stroke(ctx, "M517 339l1-3", hempInk("#65523f"), 0.8);
}

export function drawPostHook(ctx: CanvasRenderingContext2D) {
	stroke(ctx, "M522 369q4 2 6-2v-11", metalInk("#65523f"), 0.8);
}

export function drawCableSpool(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M493 368q8-2 18 0l-4 3v10l3 2h-18l5-2v-10Z", woodInk("#62513e"));
	fill(ctx, "M494 368q9-2 16 0l-1 1h-14Zm2 13h11l3 2h-18Z", woodInk("#a79375"));
	stroke(
		ctx,
		"M497 372q5 1 10 0m-10 2q5 1 10 0m-10 2q5 1 10 0m-10 2q5 1 10 0",
		woodInk("#7d6b54"),
	);
}

export const benchCableLayers = (
	[
		[
			"bench-cable-west",
			"Left bench cable",
			"M503 382c6 0 2 15 4 24 1 8 6 12 12 12q18 0 36 3",
		],
		[
			"bench-cable-center",
			"Center bench cable",
			"M507 382c6 0 2 16 4 24 2 8 8 10 14 11l29 1",
		],
		[
			"bench-cable-east",
			"Right bench cable",
			"M512 382c6 0 1 17 3 24 2 7 7 10 13 10l24 1",
		],
	] as const
).map(([id, label, path]) => ({
	id,
	label,
	group: "Bench cables",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.lineCap = "round";
		stroke(ctx, path, hempInk("#2b231b"), 3);
		const light = ctx.createLinearGradient(0, 385, 0, 422);
		light.addColorStop(0, hempInk("#b5a382"));
		light.addColorStop(0.48, hempInk("#8c7b64"));
		light.addColorStop(0.78, hempInk("#a29175"));
		light.addColorStop(1, hempInk("#8b795d"));
		stroke(ctx, path, light, 1.55);
	},
}));

export function drawFloorCable(ctx: CanvasRenderingContext2D) {
	const coil =
		"M555 428q3-2 9-2c10-2 39-3 53-1 8 1 7 4-1 5-13 3-43 3-54 1q-7-1-2-3";
	stroke(ctx, coil, hempInk("#201813"), 2.7);
	stroke(ctx, coil, hempInk("#89775e"), 1.3);
	stroke(ctx, "M561 429c13-3 39-4 54-2", hempInk("#a18b71"), 0.85);
}

export const leanToCrateLayers = crateLayers(
	"lean-to-crate",
	"Lean-to crates",
	"Lean-to crate",
	[
		[250, 372, 14, 13],
		[272, 372, 17, 14],
		[232, 385, 11, 17],
		[244, 385, 19, 18],
		[271, 385, 24, 18],
	],
);

export const shopCrateLayers = crateLayers(
	"shop-crate",
	"Shop crates",
	"Shop crate",
	[
		[340, 398, 13, 13],
		[388, 394, 12, 19],
	],
);

export const benchBinLayers = crateLayers(
	"bench-bin",
	"Bins under the bench",
	"Bench bin",
	[
		[455, 405, 8, 6],
		[467, 403, 9, 8],
		[480, 399, 9, 12],
		[491, 396, 13, 15],
	],
);

function equipmentCaseLayers<Id extends string>(
	id: Id,
	group: string,
	{
		x,
		y,
		width,
		height,
		seam,
		catches,
		handle,
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		seam: number;
		catches: readonly [number, number];
		handle?: number;
	},
) {
	const layers = [
		[
			"body",
			"Case body",
			(ctx: CanvasRenderingContext2D) => {
				fill(
					ctx,
					`M${x} ${y}l4-3h${width - 4}v${height + 3}h-${width}Z`,
					metalInk("#504334"),
				);
				fill(
					ctx,
					`M${x + 2} ${y + 3}h${width - 4}v${height - 5}h-${width - 4}Z`,
					metalInk("#42362c"),
				);
				fill(
					ctx,
					`M${x + 4} ${y + 7}h${width - 8}v1h-${width - 8}Z
				M${x + seam - 2} ${y + 8}h1v${height - 11}h-1Z`,
					metalInk("#625343"),
				);
			},
		],
		[
			"lid",
			"Case lid",
			(ctx: CanvasRenderingContext2D) => {
				fill(
					ctx,
					`M${x} ${y}l4-3h${width - 4}v1.8h-${width - 4}l-4 2Z`,
					metalInk("#807058"),
				);
				if (handle !== undefined) {
					fill(
						ctx,
						`M${x + 0.8} ${y - 1}l3-1.5h${width - 4.5}v1.3h-${width - 4.5}l-3 1.3Z`,
						metalInk("#897a62"),
					);
				}
			},
		],
		[
			"trim",
			"Case trim",
			(ctx: CanvasRenderingContext2D) => {
				const base = y + height;
				fill(
					ctx,
					`M${x} ${base - 1.6}h${width}v1.6h-${width}Z
				M${x + 1} ${y + 2}h1.25v${height - 3}h-1.25Z
				M${x + width - 2.5} ${y + 1}h1.25v${height - 2}h-1.25Z
				M${x + seam} ${y + 3}h1.5v${height - 4}h-1.5Z`,
					metalInk("#766650"),
				);
				if (handle !== undefined) {
					fill(
						ctx,
						`M${x + 1.5} ${y + 1}h1v${height - 3.4}h-1Z`,
						metalInk("#897a62"),
					);
					fill(
						ctx,
						`M${x + 2} ${base - 1.5}h${width - 3}v1.2h-${width - 3}Z
						M${x + seam - 1} ${y + 2.7}h1.6v${height - 4}h-1.6Z`,
						metalInk("#786951"),
					);
				}
			},
		],
		...(["left", "right"] as const).map(
			(side, index) =>
				[
					`${side}-latch`,
					side === "left" ? "Left case latch" : "Right case latch",
					(ctx: CanvasRenderingContext2D) =>
						fill(
							ctx,
							`M${x + catches[index]} ${y + 1}h2.6v4.2h-2.6Z`,
							metalInk("#928167"),
						),
				] as const,
		),
	] as const;
	const parts =
		handle === undefined
			? layers
			: [
					...layers,
					[
						"handle",
						"Case handle",
						(ctx: CanvasRenderingContext2D) =>
							fill(
								ctx,
								`M${x + handle} ${y - 3}l2-1.5h6l1.7 1.5Z`,
								metalInk("#71614d"),
							),
					] as const,
				];
	return parts.map(([part, label, draw]) => ({
		id: `${id}-${part}` as const,
		label,
		group,
		draw,
	}));
}

export const shopEquipmentCaseLayers = equipmentCaseLayers(
	"shop-case",
	"Shop equipment case",
	{
		x: 316,
		y: 390,
		width: 30,
		height: 21,
		seam: 19.8,
		catches: [8, 23],
	},
);
export const awningEquipmentCaseLayers = equipmentCaseLayers(
	"awning-case",
	"Awning equipment case",
	{
		x: 580,
		y: 391,
		width: 45,
		height: 20,
		seam: 24,
		catches: [7, 35],
		handle: 19,
	},
);
