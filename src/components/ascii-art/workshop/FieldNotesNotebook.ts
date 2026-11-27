import { metalInk, paperInk, woodInk } from "./materialInk";
import { sampleGlyphCell } from "../ditherGlyphs";
import { fill, stroke } from "./canvasShapes";

function drawNotebookShadow(ctx: CanvasRenderingContext2D) {
	const contact = ctx.createLinearGradient(646, 430, 828, 459);
	contact.addColorStop(0, "#151311ad");
	contact.addColorStop(0.55, "#151311ac");
	contact.addColorStop(1, "#1a16134a");
	ctx.filter = "blur(1.25px)";
	fill(
		ctx,
		"M637 431C668 428 715 432 745 440C773 435 802 444 832 451l1 7C802 456 775 446 744 447C714 439 665 437 637 437Z",
		contact,
	);
}

const leftPage =
	"M644 421l55-62q54-9 82 7-16 35-37 68C721 414 677 419 644 421Z";
const rightPage =
	"M744 434q21-31 37-68 36-4 78 9l-30 68C799 438 768 424 744 434Z";
const paperPath = `${leftPage} ${rightPage}`;
const frontEdge = "M644 421C677 419 721 414 744 434C768 424 799 438 829 443";
const cover =
	"M637 427l62-68q53-10 82 7 38-5 83 9l-33 80c-34-2-65-13-87-12q-6 4-13-2c-27-8-64-8-94-10Z";

export const notebookDither = {
	path: cover,
	left: 635,
	top: 351,
	right: 865,
	bottom: 456,
	pitchScale: 0.74,
};

function drawNotebookCover(ctx: CanvasRenderingContext2D) {
	fill(ctx, cover, "#231e19");
	stroke(
		ctx,
		"M638 430c36 2 65 0 93 10q7 5 13 2c27-1 61 12 86 12l33-77",
		"#514437",
		1.15,
	);
}

const notebookPageLayers = (
	[
		[
			"notebook-left-page",
			"Notebook left page",
			leftPage,
			[704, 376, 755, 405],
			[
				[0, paperInk("#c0ae96")],
				[0.48, paperInk("#baaa92")],
				[0.76, paperInk("#8f7d6a")],
				[0.9, paperInk("#6e5d4c")],
				[1, paperInk("#594a3c")],
			],
			[697, 395, 48],
		],
		[
			"notebook-right-page",
			"Notebook right page",
			rightPage,
			[756, 409, 833, 444],
			[
				[0, paperInk("#6d5c4a")],
				[0.12, paperInk("#b6a58d")],
				[0.47, paperInk("#b8a791")],
				[1, paperInk("#978571")],
			],
			[805, 405, 40],
		],
	] as const
).map(
	([
		id,
		label,
		path,
		[startX, startY, endX, endY],
		stops,
		[crestX, crestY, crestRadius],
	]) => ({
		id,
		label,
		draw(ctx: CanvasRenderingContext2D) {
			const shade = ctx.createLinearGradient(startX, startY, endX, endY);
			for (const [offset, color] of stops) shade.addColorStop(offset, color);
			fill(ctx, path, shade);
			ctx.save();
			ctx.clip(new Path2D(path));
			const crest = ctx.createRadialGradient(
				crestX,
				crestY,
				0,
				crestX,
				crestY,
				crestRadius,
			);
			crest.addColorStop(0, paperInk("#d7c3a82a"));
			crest.addColorStop(0.64, paperInk("#dbc7aa14"));
			crest.addColorStop(1, paperInk("#dbc7aa00"));
			ctx.fillStyle = crest;
			ctx.fillRect(
				crestX - crestRadius,
				crestY - crestRadius,
				crestRadius * 2,
				crestRadius * 2,
			);
			ctx.restore();
		},
	}),
);

function drawPaperGrain(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(paperPath));
	for (let row = 0; row < 45; row++) {
		for (let column = 0; column < 46; column++) {
			const cell = sampleGlyphCell(column + 17, row + 29);
			if (cell.toneThreshold < 0.49) continue;
			const x = 642 + (column + cell.scatterX * 3) * 4.8;
			const y = 354 + (row + cell.scatterY * 3) * 2;
			ctx.fillStyle =
				cell.glyph < 3 ? paperInk("#362b22b0") : paperInk("#f1e4cb8c");
			ctx.fillRect(x, y, 2.8 + cell.toneThreshold * 3.5, 1.05);
		}
	}
}

function drawPageEdges(ctx: CanvasRenderingContext2D) {
	const stack = new Path2D(
		`${frontEdge}l-3 8C791 447 765 436 743 441C719 428 675 430 639 428Z`,
	);
	const paper = ctx.createLinearGradient(643, 419, 829, 445);
	paper.addColorStop(0, paperInk("#665849"));
	paper.addColorStop(0.39, paperInk("#5e5042"));
	paper.addColorStop(0.54, paperInk("#3f342b"));
	paper.addColorStop(0.67, paperInk("#5a4b3d"));
	paper.addColorStop(1, paperInk("#504134"));
	ctx.fillStyle = paper;
	ctx.fill(stack);

	const sheetShade = ctx.createLinearGradient(641, 423, 818, 439);
	sheetShade.addColorStop(0, paperInk("#ac9980"));
	sheetShade.addColorStop(0.39, paperInk("#8e7b66"));
	sheetShade.addColorStop(0.55, paperInk("#463a30"));
	sheetShade.addColorStop(0.68, paperInk("#8e7a65"));
	sheetShade.addColorStop(1, paperInk("#a08a72"));

	ctx.save();
	ctx.clip(stack);
	for (const offset of [2, 4, 6.2]) {
		ctx.save();
		ctx.translate(-offset * 0.46, offset);
		stroke(ctx, frontEdge, paperInk("#332a21"), 0.85);
		ctx.restore();
	}
	for (const [offset, weight] of [
		[1.4, 0.72],
		[3, 1.15],
		[5.1, 0.8],
		[7.1, 1.05],
	]) {
		ctx.save();
		ctx.translate(-offset * 0.46, offset);
		stroke(ctx, frontEdge, sheetShade, weight);
		ctx.restore();
	}
	stroke(ctx, frontEdge, paperInk("#2b231c"), 1.15);
	ctx.restore();

	const outerEdge = ctx.createLinearGradient(834, 420, 843, 425);
	outerEdge.addColorStop(0, paperInk("#695a4b"));
	outerEdge.addColorStop(0.31, paperInk("#43372e"));
	outerEdge.addColorStop(0.57, paperInk("#635244"));
	outerEdge.addColorStop(1, paperInk("#2e251e"));
	fill(ctx, "M829 443l30-68 3 2-33 75-4-2Z", outerEdge);
	stroke(ctx, "M828 449l32-73", paperInk("#9b846a"), 0.8);
}

function drawNotebookSpine(ctx: CanvasRenderingContext2D) {
	const crease = ctx.createLinearGradient(743, 430, 752, 433);
	crease.addColorStop(0, paperInk("#3e332957"));
	crease.addColorStop(0.52, paperInk("#30261fc0"));
	crease.addColorStop(1, paperInk("#3e332900"));
	fill(ctx, "M780 366l4 0c-9 21-23 50-38 69l-4 2c14-21 28-49 38-71Z", crease);
	fill(ctx, "M735 438q7 1 9-3 3 1 6 3l1 5q-7 3-16-5Z", paperInk("#2b231c"));
	stroke(ctx, "M737 440q8 5 15 2", paperInk("#786552"), 0.85);
}

function drawPageCorner(ctx: CanvasRenderingContext2D, seconds = 0) {
	const gust = Math.max(0, Math.sin(seconds * 1.42 - 0.4));
	const lift = 1 + 8 * gust ** 2 + gust * Math.sin(seconds * 6.8);
	const tipX = 857 - lift * 0.26;
	const tipY = 376 - lift;
	const edge = `M829 373Q846 376 ${tipX} ${tipY}`;
	fill(ctx, "M856 377q-2 10-8 20-10-10-18-12Z", paperInk("#51443890"));
	const paper = ctx.createLinearGradient(tipX, tipY, 838, 391);
	paper.addColorStop(0, paperInk("#b09d83"));
	paper.addColorStop(1, paperInk("#9d8c76"));
	fill(ctx, `${edge}L${tipX - 8} 396q-6-11-20-15Z`, paper);
	stroke(ctx, edge, paperInk("#baa78c"), 0.9);
}

function drawHandwrittenNotes(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(paperPath));
	ctx.lineCap = "round";
	ctx.setLineDash([2.2, 1.35, 0.9, 0.7, 2.1, 1.7]);
	for (let row = 0; row < 4; row++) {
		const x = 686 - row * 4.1;
		const y = 387 + row * 4.3;
		ctx.lineDashOffset = row * 2.3;
		stroke(
			ctx,
			`M${x} ${y}q26-5 ${52 + (row % 3) * 5} 5`,
			paperInk("#594a3e"),
			1.2,
		);
	}
	for (let row = 0; row < 6; row++) {
		const x = 772 - row * 2.3;
		const y = 405 + row * 4.2;
		ctx.lineDashOffset = row * 1.8;
		stroke(
			ctx,
			`M${x} ${y}q${12 + row}-2 ${24 + (row % 3) * 4} 0`,
			paperInk("#55473b"),
			1.15,
		);
	}
	stroke(
		ctx,
		"M701 364q25-4 48 1m-51 3q23-3 49 1m-51 3q23-3 33-1",
		paperInk("#605145"),
		1.1,
	);
	stroke(
		ctx,
		"M826 376l20 4m-22 1 26 4m-27 0 22 5m-23 0 23 6m-24-2 19 4",
		paperInk("#615547"),
		1,
	);
}

function drawMesaSketch(ctx: CanvasRenderingContext2D) {
	const skyline =
		"M676 382l9-1 7-4 6 1 5-2 6 2 8-1 4 1 7-3 7-4 6 1 4 4 5 1 3 3 5 0 9 5";
	const rock = ctx.createLinearGradient(0, 371, 0, 389);
	rock.addColorStop(0, paperInk("#93816b"));
	rock.addColorStop(0.6, paperInk("#a18e77"));
	rock.addColorStop(1, paperInk("#aa977e"));
	fill(ctx, `${skyline}l-13 3-20-2-17 2-19 0-22-2Z`, rock);
	fill(
		ctx,
		"M691 378l9 2 3-3 5 2-4 3-15 2-7-1Z M721 380l7-4 7-4 3 2-6 7 6 3h-13l2-3Z M744 377l6 1 4 3h5l6 4-11-1-5-3-7 1Z",
		paperInk("#80705a"),
	);
	stroke(ctx, skyline, paperInk("#504235"), 1.2);
	stroke(
		ctx,
		`M690 382l10-2 10 1 7-2 10 1 8-6 4 3-4 4-6 1
		M741 374l4 6 6-1 4 4m-17-1 5-1 6 3m6-2 5 2
		M676 386q31-3 56-1l32 2m-75 3 18-2 16 1 20-1 10 1`,
		paperInk("#6a5847"),
		1.12,
	);
	ctx.setLineDash([2.5, 1.5, 1.1, 0.9]);
	stroke(
		ctx,
		"M680 384l13-4 14 2 17-2 12-4 8 3 12 6m-70 1 16-2 12 1 14-2 11-2 17 5m-74 1 21 1 20-1 11 2 19-1",
		paperInk("#58463878"),
		0.8,
	);
}

function drawRouteSketch(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(leftPage));
	ctx.lineCap = "round";
	stroke(
		ctx,
		"M667 406q7-2 14 0t14 0l10-1 9 1 8-2q4-5 11-3m-54 6 2-3 2-4m19 6 4 3 5 1m8-10 6-4 8 1",
		paperInk("#514338"),
		1.45,
	);
	stroke(
		ctx,
		"M661 414q8-1 16-4l11 2 16-3 14 3m-54 5 15-2 9 1m22-8 10 1 13-5m-42-1 14-2 9 1",
		paperInk("#73614f"),
		1.05,
	);
}

function drawPlantSketch(ctx: CanvasRenderingContext2D) {
	const leaves = [
		[778, 390],
		[780, 386],
		[783, 382],
		[787, 386],
		[788, 379],
		[792, 375],
		[797, 376],
		[802, 374],
		[807, 370],
		[814, 374],
		[815, 382],
		[818, 378],
		[822, 382],
		[824, 386],
		[825, 389],
		[828, 392],
		[815, 399],
		[821, 396],
	] as const;
	ctx.lineCap = "round";
	for (const [index, [tipX, tipY]] of leaves.entries()) {
		const root = 802 + (tipX - 802) * 0.16;
		const middle = root + (tipX - root) * 0.29;
		stroke(
			ctx,
			`M${root} ${394 + (index % 3) * 0.65}Q${middle} ${(tipY + 394) / 2} ${tipX} ${tipY}`,
			index % 3 ? paperInk("#4b3d31") : paperInk("#352a22"),
			index % 3 ? 1.17 : 1.57,
		);
	}
	fill(ctx, "M791 394q11-3 22 0-12 2-22 0Z", paperInk("#665646"));
	stroke(ctx, "M794 397q11-1 20 0m-17 2q4-1 10 0", paperInk("#6b5948"), 1.05);
}

function drawRockSketch(ctx: CanvasRenderingContext2D) {
	const edge = "M794 419l4-4 6-.5 3-1.5 7 .4 4 3 1.6 6-3 4-8 2-11-2-3-3Z";
	fill(ctx, edge, paperInk("#665748"));
	fill(ctx, "M795 420l4-5 8-2 7.4.4 2.4 3-4 4-7.8-1-4 4Z", paperInk("#988471"));
	fill(
		ctx,
		"M804 423l5-4 4 1 4-3 2.6 5.6-3 4-7 1.3 1-3.5-4 1.6Z",
		paperInk("#655345"),
	);
	fill(ctx, "M799 415l6-1 3 1-4 3-3 1-4-1Z", paperInk("#a28e78"));
	stroke(ctx, edge, paperInk("#493b31"), 1);
	stroke(
		ctx,
		"M796 421l5 2 4-4 6 1m-9 7 5-6m3 6 3-5 5-3m-17-2 6-.8m-6 9 5 1.4m8-3 3-.6",
		paperInk("#4d4034"),
		0.85,
	);
}

const pencilTip = { x: 844.62, y: 453.35 };
const pencilAngle = Math.atan2(-75, 56);
const pencilLength = 92.6;

const pencilOutline = [
	[0, 0],
	[16.5, -3.55],
	[91, -3.75],
	[pencilLength, -2.5],
	[pencilLength, 2.5],
	[91, 4],
	[16.5, 4],
]
	.map(
		([along, across]) =>
			`${pencilTip.x + along * Math.cos(pencilAngle) - across * Math.sin(pencilAngle)} ${pencilTip.y + along * Math.sin(pencilAngle) + across * Math.cos(pencilAngle)}`,
	)
	.join(" ");
export const pencilDither = {
	path: `M${pencilOutline}Z`,
	left: 843,
	top: 375,
	right: 905,
	bottom: 455,
	pitchScale: 0.68,
};

function drawPencilShadow(ctx: CanvasRenderingContext2D) {
	ctx.translate(pencilTip.x + 2, pencilTip.y + 2.5);
	ctx.rotate(pencilAngle);
	const shade = ctx.createLinearGradient(0, 0, 0, 13);
	shade.addColorStop(0, "#151311e6");
	shade.addColorStop(0.42, "#1b1612b5");
	shade.addColorStop(1, "#1c171300");
	fill(ctx, "M0 0h91l4 3-5 9-78-2Z", shade);
}

function drawPencilShaft(ctx: CanvasRenderingContext2D) {
	const lacquer = ctx.createLinearGradient(0, -3.55, 0, 4);
	lacquer.addColorStop(0, woodInk("#9b856b"));
	lacquer.addColorStop(0.24, woodInk("#88765f"));
	lacquer.addColorStop(0.46, woodInk("#70604e"));
	lacquer.addColorStop(0.68, woodInk("#685a48"));
	lacquer.addColorStop(1, woodInk("#4c4034"));
	fill(ctx, "M16.5-3.55H75v7.55H16.5Z", lacquer);
}

function drawPencilShaftFacet(ctx: CanvasRenderingContext2D) {
	const edge = ctx.createLinearGradient(16.5, -3.4, 74.5, -2.05);
	edge.addColorStop(0, woodInk("#948068"));
	edge.addColorStop(0.6, woodInk("#a18b71"));
	edge.addColorStop(1, woodInk("#978268"));
	fill(ctx, "M16.5-3.3H75v.95l-58.5-.25Z", edge);
}

function drawPencilWood(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M1 0l15.5-3.55 2.4 1.55v1.7l-1.2 2-1.2 2.3Z", woodInk("#d0b99e"));
	fill(ctx, "M1 0l17.9-.3-2.4 4.3Z", woodInk("#98846e"));
}

function drawPencilLead(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M0 0l5.8-1.26v2.44Z", metalInk("#4d4134"));
	fill(ctx, "M1-.18l4.8-1.08v.66Z", metalInk("#8a7b68"));
}

function drawPencilFerrule(ctx: CanvasRenderingContext2D) {
	const metal = ctx.createLinearGradient(0, -3.7, 0, 4);
	metal.addColorStop(0, metalInk("#beac94"));
	metal.addColorStop(0.45, metalInk("#97866e"));
	metal.addColorStop(1, metalInk("#514538"));
	fill(ctx, "M75-3.7h10.2V4H75Z", metal);
	fill(ctx, "M75.9-3.7h1.2V4h-1.2Zm7.9 0h1V4h-1Z", metalInk("#5e5041"));
}

function drawPencilEraser(ctx: CanvasRenderingContext2D) {
	const rubber = ctx.createLinearGradient(0, -3.5, 0, 3.7);
	rubber.addColorStop(0, "#a08a75");
	rubber.addColorStop(0.45, "#796554");
	rubber.addColorStop(1, "#4b3e34");
	fill(
		ctx,
		`M85.2-3.5H90q2.6 0 2.6 2.2v2.6Q${pencilLength} 3.7 90 3.7h-4.8Z`,
		rubber,
	);
}

const pencilLayers = (
	[
		["pencil-shaft", "Pencil shaft", drawPencilShaft],
		["pencil-shaft-facet", "Pencil lacquer facet", drawPencilShaftFacet],
		["pencil-wood", "Sharpened wood", drawPencilWood],
		["pencil-lead", "Graphite tip", drawPencilLead],
		["pencil-ferrule", "Pencil ferrule", drawPencilFerrule],
		["pencil-eraser", "Pencil eraser", drawPencilEraser],
	] as const
).map(([id, label, draw]) => ({
	id,
	label,
	group: "Pencil",
	draw(ctx: CanvasRenderingContext2D) {
		ctx.translate(pencilTip.x, pencilTip.y);
		ctx.rotate(pencilAngle);
		draw(ctx);
	},
}));

export const notebookLayers = [
	{ id: "notebook-shadow", label: "Notebook shadow", draw: drawNotebookShadow },
	{ id: "notebook-cover", label: "Notebook cover", draw: drawNotebookCover },
	...notebookPageLayers,
	{ id: "notebook-paper-grain", label: "Paper grain", draw: drawPaperGrain },
	{ id: "pages", label: "Stacked page edges", draw: drawPageEdges },
	{ id: "notebook-spine", label: "Notebook spine", draw: drawNotebookSpine },
	{ id: "ink", label: "Handwritten notes", draw: drawHandwrittenNotes },
	{ id: "mesa-sketch", label: "Mesa sketch", draw: drawMesaSketch },
	{ id: "route-sketch", label: "Route sketch", draw: drawRouteSketch },
	{ id: "plant-sketch", label: "Plant sketch", draw: drawPlantSketch },
	{ id: "rock-sketch", label: "Rock sketch", draw: drawRockSketch },
	{ id: "page-corner", label: "Loose page corner", draw: drawPageCorner },
	{ id: "pencil-shadow", label: "Pencil shadow", draw: drawPencilShadow },
	...pencilLayers,
] as const;
