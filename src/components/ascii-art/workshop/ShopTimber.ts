import { woodInk } from "./materialInk";
import { fill } from "./canvasShapes";

type Paint = (ctx: CanvasRenderingContext2D) => void;

function timberLayers<Id extends string>(
	group: string,
	parts: readonly (readonly [id: Id, label: string, draw: Paint])[],
) {
	return parts.map(([id, label, draw]) => ({ id, label, group, draw }));
}

function shadedFace(
	path: string,
	top: number,
	bottom: number,
	stops: readonly (readonly [number, string])[],
): Paint {
	return (ctx) => {
		const shade = ctx.createLinearGradient(0, top, 0, bottom);
		for (const [offset, color] of stops) shade.addColorStop(offset, color);
		fill(ctx, path, shade);
	};
}

function frameBrace(path: string): Paint {
	return shadedFace(path, 313, 351, [
		[0, woodInk("#665849")],
		[1, woodInk("#544739")],
	]);
}

function framePost(
	x: number,
	y: number,
	bottom: number,
	width: number,
	face: string,
): Paint {
	return (ctx) => {
		const post = ctx.createLinearGradient(x, 0, x + width, 0);
		post.addColorStop(0, woodInk("#3c332a"));
		post.addColorStop(0.39, face);
		post.addColorStop(0.74, face);
		post.addColorStop(1, woodInk("#54493c"));
		fill(ctx, `M${x} ${y}h${width}v${bottom - y}h-${width}Z`, post);
		fill(
			ctx,
			`M${x - 3} ${bottom}l3-5h${width}l4 5-2 3h-${width + 5}Z`,
			woodInk("#685b49"),
		);
		for (const offset of [30, 55, 74]) {
			fill(
				ctx,
				`M${x + 1} ${y + offset}h${width - 1}v1.3h-${width - 1}Z`,
				woodInk("#29231c80"),
			);
		}
	};
}

const frameLayers = timberLayers("Shop frame", [
	[
		"shop-interior",
		"Shop interior shade",
		shadedFace("M330 307l45-25 178 33v94l-222 1Z", 303, 416, [
			[0, woodInk("#151311")],
			[0.8, woodInk("#191612")],
			[1, woodInk("#1c1814")],
		]),
	],
	[
		"shop-west-brace",
		"Shop west brace",
		frameBrace("M333 342l19-22 6-2-25 30Z"),
	],
	[
		"shop-left-center-brace",
		"Shop center brace on the left",
		frameBrace("M368 318l13 23-2 5-15-28Z"),
	],
	[
		"shop-right-center-brace",
		"Shop center brace on the right",
		frameBrace("M384 339l22-24h6l-28 30Z"),
	],
	[
		"shop-east-brace",
		"Shop east brace",
		frameBrace("M527 315l23 26v5l-30-31Z"),
	],
	[
		"shop-west-post",
		"Shop west post",
		framePost(330, 307, 406, 3.8, woodInk("#4e4235")),
	],
	[
		"shop-center-post",
		"Shop center post",
		framePost(379.8, 285, 409, 5.8, woodInk("#7b6c57")),
	],
	[
		"shop-east-post",
		"Shop east post",
		framePost(547, 314, 408, 5, woodInk("#70614d")),
	],
]);

function rafter(path: string): Paint {
	return shadedFace(path, 285, 322, [
		[0, woodInk("#665748")],
		[1, woodInk("#4c4135")],
	]);
}

const topRafter = rafter("M320 307l50-23 6-.8L562 313l-2 2-186-29-51 23Z");

const roofLayers = timberLayers("Shop roof", [
	[
		"shop-roof-face",
		"Weathered roof face",
		shadedFace("M320 307l53-24 189 30-186-10Z", 283, 314, [
			[0, woodInk("#958370")],
			[0.48, woodInk("#706151")],
			[1, woodInk("#463b30")],
		]),
	],
	[
		"shop-roof-soffit",
		"Shade beneath the roof",
		shadedFace("M378 286l176 28-6 5-164-4Z", 285, 319, [
			[0, woodInk("#211912a0")],
			[0.72, woodInk("#1c181481")],
			[1, woodInk("#1c181414")],
		]),
	],
	[
		"shop-rafter",
		"Shop upper rafter",
		(ctx) => {
			topRafter(ctx);
			fill(
				ctx,
				"M321 306l49-22 6-.8L562 313l-2 .8-186-28-49 21Z",
				woodInk("#ab987e41"),
			);
		},
	],
	[
		"shop-lower-rafter",
		"Shop lower rafter",
		rafter("M328 312l47-22 178 28v2l-177-27-47 21Z"),
	],
	[
		"shop-inner-purlin",
		"Inner timber under the roof",
		shadedFace("M383 310l30 1 59-.4 48 3-26 1-72-1.1-39 1Z", 307, 315, [
			[0, woodInk("#3c3228")],
			[0.62, woodInk("#756550")],
			[1, woodInk("#41362c")],
		]),
	],
	[
		"shop-west-roof-upright",
		"West roof upright",
		rafter("M351 302h2.5v15h-2.5Z"),
	],
	["shop-peak-upright", "Roof peak upright", rafter("M374 292l2-1 .5 22H374Z")],
	[
		"shop-inner-roof-upright",
		"Inner roof upright",
		rafter("M402 296l2.5 1v14H402Z"),
	],
	[
		"shop-east-roof-upright",
		"East roof upright",
		rafter("M416 297l2.5 1v14H416Z"),
	],
	[
		"shop-west-roof-diagonal",
		"West roof diagonal",
		rafter("M339 308l5-2 12 10-2 1Z"),
	],
	[
		"shop-middle-roof-diagonal",
		"Middle roof diagonal",
		rafter("M355 313l16-19 3-1-15 20Z"),
	],
	[
		"shop-east-roof-diagonal",
		"East roof diagonal",
		rafter("M389 296l17 14-3 1-17-16Z"),
	],
	[
		"shop-crossbeam",
		"Shop crossbeam",
		shadedFace("M379 314.5l173 .9v3.6l-173-1.2Z", 314, 319, [
			[0, woodInk("#3a322a")],
			[0.48, woodInk("#6f604e")],
			[0.76, woodInk("#605344")],
			[1, woodInk("#30291f")],
		]),
	],
	[
		"shop-west-crossbeam",
		"Crossbeam above the west wall",
		shadedFace("M330 318.8l49-3.2v2.4l-49 3.4Z", 315, 322, [
			[0, woodInk("#3a2f25")],
			[0.55, woodInk("#5b4c3e")],
			[1, woodInk("#342c23")],
		]),
	],
]);

function leanToPost(
	x: number,
	top: number,
	base: number,
	width: number,
	light: string,
	highlights = "",
): Paint {
	return (ctx) => {
		const face = ctx.createLinearGradient(x, 0, x + width, 0);
		face.addColorStop(0, woodInk("#30271e"));
		face.addColorStop(0.55, light);
		face.addColorStop(1, woodInk("#594d3e"));
		fill(ctx, `M${x} ${top}h${width}v${base - top}h-${width}Z`, face);
		fill(ctx, `M${x - 2} ${base + 2}l2-3h${width}l2 3Z`, woodInk("#645644"));
		if (highlights) fill(ctx, highlights, woodInk("#a28f786b"));
	};
}

function leanToBrace(path: string): Paint {
	return (ctx) => fill(ctx, path, woodInk("#594c3d"));
}

const leanToLayers = timberLayers("Lean-to frame", [
	[
		"lean-to-interior",
		"Lean-to interior shade",
		shadedFace("M218 344l48-15 39-1v73l-86 2Z", 329, 404, [
			[0, woodInk("#171410")],
			[0.75, woodInk("#181411c0")],
			[1, woodInk("#15121080")],
		]),
	],
	[
		"lean-to-upper-rafter",
		"Lean-to upper rafter",
		(ctx) =>
			fill(ctx, "M212 340l53-14 46 1-2 2-42-1-54 14Z", woodInk("#6f604f")),
	],
	[
		"lean-to-lower-rafter",
		"Lean-to lower rafter",
		(ctx) =>
			fill(ctx, "M218 343l49-13 40 1v2l-40-1-49 13Z", woodInk("#554838")),
	],
	[
		"lean-to-west-brace",
		"Lean-to west brace",
		leanToBrace("M218 356l14-14 4-1-18 21Z"),
	],
	[
		"lean-to-inner-brace",
		"Lean-to inner brace",
		leanToBrace("M247 358l13-17 2.5-.7-15.5 22Z"),
	],
	[
		"lean-to-peak-brace",
		"Lean-to peak brace",
		leanToBrace("M254 332l13 15v4l-16-17Z"),
	],
	[
		"lean-to-right-brace",
		"Lean-to center-right brace",
		leanToBrace("M268 348l12-16 3.5.2-15.5 20Z"),
	],
	[
		"lean-to-east-brace",
		"Lean-to east brace",
		leanToBrace("M290 331h3l12 17v4Z"),
	],
	[
		"lean-to-west-post",
		"Lean-to west post",
		leanToPost(217.4, 343, 400, 3, woodInk("#71634f"), "M218 344h3v1h-3Z"),
	],
	[
		"lean-to-inner-post",
		"Lean-to inner post",
		leanToPost(247, 338, 388, 2.5, woodInk("#504537")),
	],
	[
		"lean-to-center-post",
		"Lean-to center post",
		leanToPost(
			264.5,
			327,
			403,
			4,
			woodInk("#93816b"),
			"M264 328h5v2.3h-5ZM264 397h5v1.8h-5Z",
		),
	],
	[
		"lean-to-east-post",
		"Lean-to east post",
		leanToPost(302, 330, 398, 3.6, woodInk("#675846"), "M303 330h4v1.5h-4Z"),
	],
]);

export const shopTimberLayers = [
	...frameLayers,
	...roofLayers,
	...leanToLayers,
];
