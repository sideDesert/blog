import type { Plant } from "./SceneScenery";
import { drawDesertTufts, drawRock } from "./WorkshopProps";

function fill(
	ctx: CanvasRenderingContext2D,
	shape: string,
	ink: string | CanvasGradient,
) {
	ctx.fillStyle = ink;
	ctx.fill(new Path2D(shape));
}

function stroke(
	ctx: CanvasRenderingContext2D,
	shape: string,
	ink: string,
	width = 1,
) {
	ctx.strokeStyle = ink;
	ctx.lineWidth = width;
	ctx.stroke(new Path2D(shape));
}

function drawEscarpment(ctx: CanvasRenderingContext2D) {
	const skyline = new Path2D(
		"M0 140 21 133 53 131 85 129 111 125 132 126 138 130 144 155 164 156 174 159 181 180 218 179 240 176 275 173 285 176 292 198 305 197 314 208 339 222 373 223 393 228 411 221 440 216 483 214 520 227 577 227 614 235 649 233 701 239 738 234 771 244 807 243 846 229 877 232 922 225 959 235 1000 230V327H0Z",
	);
	const wash = ctx.createLinearGradient(0, 129, 0, 325);
	wash.addColorStop(0, "#302921");
	wash.addColorStop(0.55, "#25211b");
	wash.addColorStop(1, "#151514");
	ctx.fillStyle = wash;
	ctx.fill(skyline);

	ctx.save();
	ctx.clip(skyline);
	const rimLight = ctx.createLinearGradient(0, 0, 325, 0);
	rimLight.addColorStop(0, "#413a32");
	rimLight.addColorStop(0.27, "#51473b");
	rimLight.addColorStop(0.4, "#6d6050");
	rimLight.addColorStop(0.51, "#4b4237");
	rimLight.addColorStop(0.79, "#494034");
	rimLight.addColorStop(0.98, "#554a3e");
	fill(
		ctx,
		"M0 139 27 134 91 129 111 125 138 128 144 157 173 158 179 180 159 175 141 167 132 137 114 132 50 136 9 142ZM181 180l64-5 30-2 10 3 12 14 23 18-16-4-27-23-27-1-37 4-31 0Z",
		rimLight,
	);
	fill(
		ctx,
		"M23 138l13-1-2 26-8 10Zm40-4 12-1-2 32-8 8Zm29-2 13-2-1 33-8 7Zm54 27 14 1 7 21-10-4Zm75 24 15-1 4 21-16-1Zm33-2 15-2 5 22-14-1Z",
		"#211d19",
	);
	const stratum = ctx.createLinearGradient(0, 169, 0, 264);
	stratum.addColorStop(0, "#43382d");
	stratum.addColorStop(0.52, "#4e4337");
	stratum.addColorStop(1, "#29231d00");
	fill(
		ctx,
		"M0 164q47-7 111 7 19 7 38 14 34 22 76 30 54 13 107 15l-10 8-43-5-50-10-53-14-42-20-31-10Q54 168 0 171ZM22 195q74-13 118 9 33 12 58 26l-24-4-34-13q-49-25-118-12Z",
		stratum,
	);
	fill(
		ctx,
		`M63 182q47-7 69 12l34 12 22 11 25 4 18 6-19 0-34-6-35-14-29-15-45-5Z
		M119 172l22 14 22 17 28 7 35 11 23 3 10 8-17-3-32-6-29-8-27-11-21-19Z
		M194 224l58 5 24 7 28 6 27 11 29 6-37 1-21-11-32-9-21-6-55-6Z
		M289 209l18 7 27 7 35 7 16 7-25-3-41-7-27-9Z`,
		"#6657447a",
	);
	const fissures = [
		[13, 140, 17],
		[34, 137, 24],
		[49, 134, 30],
		[58, 134, 19],
		[79, 132, 28],
		[108, 128, 39],
		[115, 128, 41],
		[123, 127, 48],
		[133, 128, 45],
		[142, 138, 42],
		[152, 158, 27],
		[169, 159, 31],
		[195, 181, 21],
		[212, 181, 27],
		[236, 178, 31],
		[261, 176, 28],
		[278, 175, 37],
		[286, 179, 32],
		[300, 192, 19],
	];
	for (const [index, [x, y, depth]] of fissures.entries()) {
		const drift = x < 125 ? 1 : 7;
		const width = 2 + (index % 4);
		const stone = ctx.createLinearGradient(0, y, 0, y + depth);
		stone.addColorStop(0, x < 105 ? "#716253" : "#9a886e");
		stone.addColorStop(0.64, x < 105 ? "#504537" : "#6d5d4b");
		stone.addColorStop(1, "#4a3d2e45");
		fill(
			ctx,
			`M${x} ${y}l-${width + 4} 3 ${drift} ${depth - 3} ${width + 7} 3Z`,
			"#191611",
		);
		fill(
			ctx,
			`M${x} ${y}l${width} 1q-1 ${depth * 0.6} ${drift} ${depth}l-${width + 1} -3Z`,
			stone,
		);
	}
	ctx.restore();
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

function drawValleyFolds(ctx: CanvasRenderingContext2D) {
	ctx.filter = "blur(3px)";
	const sand = ctx.createLinearGradient(0, 258, 0, 390);
	sand.addColorStop(0, "#4d4236");
	sand.addColorStop(0.45, "#524438");
	sand.addColorStop(1, "#2c251f00");
	fill(
		ctx,
		`
		M30 292q36-8 71-27t72-19q23 5 47 0-20 10-46 6-44-1-65 19-36 19-79 26Z
		M258 356q44-10 70-29 30-22 67-23 44 5 82-20-27 25-80 28-35 3-61 21-36 20-78 26Z
		M505 296q38-13 78-10 34 4 69-12 29-12 61-19l-18 12-27 9q-54 24-90 18-38-1-73 6Z
	`,
		sand,
	);
	fill(
		ctx,
		`
		M42 297q53-13 102-40-38 36-92 45Z
		M238 354q62-6 104-31-32 27-67 33Z
		M431 311q52-13 95-37-22 18-44 27l-52 16Z
	`,
		"#28211c",
	);
	fill(
		ctx,
		`
		M36 354q67-11 116-4t122-11q-58 17-112 16t-126 4Z
		M234 372q85-20 154-14t123-15q-39 22-128 22-78-1-149 11Z
		M444 337q50-17 87-15t102-19q-51 22-96 25-43 0-92 12Z
	`,
		"#51443661",
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

function drawLookoutRise(ctx: CanvasRenderingContext2D) {
	const shade = ctx.createLinearGradient(818, 223, 849, 326);
	shade.addColorStop(0, "#493e34");
	shade.addColorStop(0.45, "#2b2621");
	shade.addColorStop(1, "#201c1800");
	fill(
		ctx,
		"M609 294q63-14 101-27l32-12 24-19 19-9 15-2 19-10 31-2 15 5 21-2 26 10 20 15 28 8 26 21-39 32-113 10-114-4-83 25Z",
		shade,
	);
	const juttingStone = ctx.createLinearGradient(0, 218, 0, 292);
	juttingStone.addColorStop(0, "#756758");
	juttingStone.addColorStop(0.6, "#594b3e");
	juttingStone.addColorStop(1, "#42372c60");
	fill(
		ctx,
		`M616 294q48-17 95-25l16-7 17-6-16 11-45 13-38 10Z
		M682 272l12-8 18-2 8-7 17-2-15 8-17 4-15 8Z
		M731 256l16-13 10-3 8-11 15-2 11-5-13 10-11 3-11 13Z
		M764 252l10-10 13-5 9-13 17-4-6 8-9 4-8 13Z
		M786 255l14-11 11-20 16-7 11 2-15 8-7 12-9 8Z
		M813 271l11-15 10-19 16-10-6 9-6 16-14 14Z
		M828 231l18-9 13 0 11 3 13-7 10 1-12 5-10 5-14-2-13 3Z`,
		juttingStone,
	);
	fill(
		ctx,
		`M782 245l16-13-5 13-10 9-27 7Z
		M811 249l14-21 14-4-10 8-10 19-24 8Z
		M848 238l16-5 25-7 14 7-28 6-13 19-30 13 12-14Z
		M863 276l29-18 17-17 22 6-20 4-14 18-23 9Z`,
		"#1d1916b0",
	);
	fill(
		ctx,
		`M610 298q39-13 80-15l28-9-7 6-23 6-40 5-38 11Z
		M611 312q40-12 72-13l37-8-14 6-47 8-49 11Z
		M619 322l46-11-10 6-32 8Z
		M789 280q26-13 52-12l48 6-19 0-33-3-32 5Z`,
		"#51473a84",
	);
	for (const [x, y, size] of [
		[688, 268, 0.22],
		[704, 261, 0.22],
		[724, 252, 0.26],
		[737, 245, 0.27],
		[764, 231, 0.3],
	]) {
		drawRock(ctx, "boulder", x, y, size);
	}
}

function drawTrail(ctx: CanvasRenderingContext2D) {
	const sand = ctx.createLinearGradient(0, 272, 0, 367);
	sand.addColorStop(0, "#554a3e");
	sand.addColorStop(0.35, "#655849");
	sand.addColorStop(0.77, "#5b4e40");
	sand.addColorStop(1, "#574a3900");
	fill(
		ctx,
		"M654 360c10-11 27-16 32-23 5-5-13-6-11-14 4-10 41-18 57-23 19-6 44-11 41-18-2-5-24-8-24-11 1-3 9-5 24-7-13 5-19 6-18 8 3 2 26 5 27 11 1 10-32 16-52 22-17 5-44 13-43 19 1 4 14 8 13 13-1 5-22 15-30 24Z",
		sand,
	);
	fill(
		ctx,
		"M667 358q12-10 24-17 7-5 0-9l-8-4 8 1q17 5 5 12-16 12-29 17Zm41-46 25-9 25-7q-13 8-50 16Z",
		"#41362b",
	);
}

function drawLookout(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M805 227l10-8 11 2 5-3 24 1 13 5 5 6-15 4-31-3-15 3Z", "#42382e");
	fill(ctx, "M820 204l7-4 25-1 7 4-18 2Z", "#8d7d6b");
	fill(ctx, "M820 204l21-2v19l-21 3Z", "#6b5b4b");
	fill(ctx, "M841 202l18 1v19l-18-1Z", "#302921");
	fill(ctx, "M826 207l8-1v7l-8 1Z", "#141211");
	fill(ctx, "M825 206l10-1v2l-10 1Zm0 8 10-1v2l-10 1Z", "#9d8e79");
	fill(
		ctx,
		"M814 221l7-2v3l-6 4-8 2Zm7 2 9-4 10 1-6 3-13 3Zm23 1 12-2 7 3-18 2Z",
		"#7c6d5a",
	);
	stroke(
		ctx,
		"M821 206l3-1m12 0 5-1m-21 12 5-1m10 3 6-1m1-12 15 1m-14 5 13 1m-12 5 10 1",
		"#6f6252",
		0.75,
	);
}

function drawLedge(ctx: CanvasRenderingContext2D) {
	const ledge = new Path2D(
		"M438 495q13-42 37-74l20-13 25-8 12-7 47-13 24-14 38-8 51-3 35-5 43 0 31-9 45 1 33 1 37 5 21 12 32 7 27 13 12 21-12 25-34 28-52 26-82 20H438Z",
	);
	const stone = ctx.createLinearGradient(0, 355, 25, 501);
	stone.addColorStop(0, "#3a312a");
	stone.addColorStop(0.59, "#302820");
	stone.addColorStop(1, "#151311");
	ctx.fillStyle = stone;
	ctx.fill(ledge);
	ctx.save();
	ctx.clip(ledge);

	const top = ctx.createLinearGradient(684, 346, 710, 480);
	top.addColorStop(0, "#706253");
	top.addColorStop(0.45, "#50453a");
	top.addColorStop(0.79, "#42382e");
	top.addColorStop(1, "#2d261f");
	fill(
		ctx,
		`M470 425l20-17 30-8 12-7 47-13 24-14 38-8 51-3 35-5 43 0 31-9 45 1 33 1 37 5 21 12 32 7 27 13 12 21-22 23-40 19-56 15-53 16-66 11-51-3-19-6-42-1-16-9-34-9-37 2-24-8-20 1-31-13-14 4-23-7Z`,
		top,
	);

	const face = ctx.createLinearGradient(525, 401, 542, 495);
	face.addColorStop(0, "#655748");
	face.addColorStop(0.47, "#4c4137");
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

	fill(
		ctx,
		`M483 419q39-20 69-24l25-9-10 8-48 12-21 12Z
		M552 397l30-19 45-16 42-6 32 1-35 5-42 10-28 14-29 11Z
		M741 356l36-6 29-9 43 2 25 4-34-1-30 1-32 9Z
		M869 451q40-5 85-28l31-17-14 13-41 23-33 10Z`,
		"#8a786367",
	);
	fill(
		ctx,
		`M571 412l44-19 35-3 34-10-14 8-28 9-23 0-37 14Z
		M597 440q38-12 88-10l28 10-31-5-37 1-25 7Z
		M728 474q26-4 68-7l53-10-18 7-41 8-37 4Z
		M895 372q49 6 74 26l-20-8-26-12Z`,
		"#2f251e8f",
	);
	ctx.restore();
}

function drawNotebookShadow(ctx: CanvasRenderingContext2D) {
	const contactShadow = ctx.createLinearGradient(747, 412, 747, 463);
	contactShadow.addColorStop(0, "#151311e0");
	contactShadow.addColorStop(0.66, "#1a161380");
	contactShadow.addColorStop(1, "#1a161300");
	ctx.fillStyle = contactShadow;
	ctx.fill(
		new Path2D("M638 434q52-25 114-14l99 17-14 20q-51-5-90-15-48 9-109 2Z"),
	);
}

const leftPage = "M649 419l50-60q59-10 82 7-16 35-37 66-44-15-95-13Z";
const rightPage = "M744 432q21-29 37-66 39-4 76 10l-30 66q-60-17-83-10Z";

function drawNotebook(ctx: CanvasRenderingContext2D) {
	const cover =
		"M640 429l59-69q49-11 83 7 37-6 79 10l-29 78q-46 1-87-15-43-9-105-7Z";
	fill(ctx, cover, "#2b251f");

	for (const [path, start, end, stops] of [
		[
			leftPage,
			659,
			762,
			[
				[0, "#9e907b"],
				[0.63, "#9e8e79"],
				[0.83, "#80705b"],
				[1, "#463a30"],
			],
		],
		[
			rightPage,
			750,
			854,
			[
				[0, "#716350"],
				[0.3, "#978774"],
				[0.78, "#8d7e6c"],
				[1, "#827561"],
			],
		],
	] as const) {
		const shade = ctx.createLinearGradient(start, 372, end, 412);
		for (const [offset, color] of stops) shade.addColorStop(offset, color);
		fill(ctx, path, shade);
		ctx.save();
		ctx.clip(new Path2D(path));
		for (let index = 0; index < 240; index++) {
			const grainX = 645 + ((index * 83) % 216);
			const grainY = 356 + ((index * 37) % 94);
			ctx.fillStyle = index % 3 ? "#b3a18b75" : "#382e244b";
			ctx.fillRect(grainX, grainY, 1 + (index % 2), 0.55);
		}
		ctx.restore();
	}
}

function drawPageEdges(ctx: CanvasRenderingContext2D) {
	fill(
		ctx,
		"M649 419q52-2 95 13 23-7 83 10l-3 10q-57-14-80-12-53-14-103-9Z",
		"#5b4e3f",
	);
	stroke(
		ctx,
		"M646 425q52-6 98 9 32-4 81 11m-182-17q53-5 101 9 32-3 80 11",
		"#998670",
		1,
	);
	stroke(ctx, "M641 431q55-4 103 10 30-1 81 12", "#8a7660", 1.2);
	fill(ctx, "M781 366l2.8 0q-14 36-37 66l-3-1q21-29 37.2-65Z", "#493d30");
	fill(ctx, "M827 442l30-66 4 1-33 73Z", "#544836");
}

function drawHandwrittenNotes(ctx: CanvasRenderingContext2D) {
	ctx.clip(new Path2D(`${leftPage} ${rightPage}`));
	ctx.setLineDash([2, 1.7, 0.7, 0.9, 2.5, 2.1]);
	for (let row = 0; row < 7; row++) {
		const x = 686 - row * 4.1;
		const y = 387 + row * 4.3;
		ctx.lineDashOffset = row * 2.3;
		stroke(ctx, `M${x} ${y}q29-4 ${52 + (row % 3) * 6} 6`, "#514337", 1.05);
	}
	for (let row = 0; row < 6; row++) {
		const x = 765 - row * 2.6;
		const y = 404 + row * 4.2;
		ctx.lineDashOffset = row * 1.8;
		stroke(
			ctx,
			`M${x} ${y}q${12 + row}-2 ${24 + (row % 3) * 4} 0`,
			"#4f473a",
			1,
		);
	}
	stroke(ctx, "M701 364q25-4 48 1m-51 3q24-3 36 0", "#65564a", 0.85);
	stroke(
		ctx,
		"M816 378l21 3m-22 1 26 4m-27 0 22 5m-25 1 23 5m-23-1 19 4",
		"#615547",
		1,
	);
}

function drawMesaSketch(ctx: CanvasRenderingContext2D) {
	fill(
		ctx,
		"M680 382l15-6 13 1 9-3 12 1 7-5 11-1 9 6 9 8-14-7-8-3-15 6-10-1-13 4Z",
		"#5b4d3e",
	);
	stroke(ctx, "M676 383q15-5 26-3l13-3 14 1 13-8 14 8 10 5", "#45372d", 0.9);
	stroke(
		ctx,
		"M677 386q34-5 57-1l28 3m-68 6 15-2 15 2 14-3 13 3",
		"#665747",
		0.76,
	);
}

function drawPlantSketch(ctx: CanvasRenderingContext2D) {
	const baseX = 799;
	const baseY = 395;
	for (let leaf = 0; leaf < 14; leaf++) {
		const spread = leaf / 6.5 - 1;
		const rootX = baseX + spread * 4;
		const dx = spread * (19 + (leaf % 3));
		const dy = 5 + (18 + (leaf % 4)) * (1 - Math.abs(spread));
		stroke(
			ctx,
			`M${rootX} ${baseY + (leaf % 2)}q${dx * 0.33} ${-dy * 0.72} ${dx} ${-dy}`,
			leaf % 3 ? "#514236" : "#41362d",
			0.86,
		);
	}
	stroke(ctx, "M785 397q13-1 24 0m-22 2 22 1", "#615244", 0.8);
}

function drawRockSketch(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M793 421l5-6 11-2 8 3 2 8-6 3-15 1Z", "#675849");
	fill(ctx, "M795 421l5-6 9-2 4 3-4 4-9 3Z", "#887764");
	stroke(
		ctx,
		"M793 421l5-6 11-2 8 3 2 8-6 3-15 1-5-4Zm7 6 4-7 5 0 5-4",
		"#44382d",
		0.9,
	);
}

const pencilAngle = Math.atan2(-75, 54);

function drawPencilShadow(ctx: CanvasRenderingContext2D) {
	ctx.translate(848, 455);
	ctx.rotate(pencilAngle);
	const shade = ctx.createLinearGradient(0, 0, 0, 13);
	shade.addColorStop(0, "#151311e0");
	shade.addColorStop(0.37, "#1c1713b5");
	shade.addColorStop(1, "#1c171300");
	fill(ctx, "M0 0h89l4 3-5 9-76-2Z", shade);
}

function drawPencil(ctx: CanvasRenderingContext2D) {
	ctx.translate(846, 453);
	ctx.rotate(pencilAngle);

	const lacquer = ctx.createLinearGradient(0, -3.4, 0, 3.4);
	lacquer.addColorStop(0, "#8b7660");
	lacquer.addColorStop(0.35, "#635141");
	lacquer.addColorStop(1, "#382c22");
	fill(ctx, "M18-3.4h57v6.8H18Z", lacquer);
	fill(ctx, "M18-2.9h57v1.2H18Z", "#98836b");
	fill(ctx, "M0 0l18-3.4 2 1.3v1.5l-1 1.5-1 2.5Z", "#9d8970");
	fill(ctx, "M0 0l18-1.3 2 1.9-2 2.8Z", "#64513f");
	fill(ctx, "M0 0l5.5-1.05v1.9Z", "#42392d");

	const ferrule = ctx.createLinearGradient(0, -3.5, 0, 3.5);
	ferrule.addColorStop(0, "#a3937e");
	ferrule.addColorStop(0.45, "#7b6b56");
	ferrule.addColorStop(1, "#534638");
	fill(ctx, "M75-3.5h10v7H75Z", ferrule);
	fill(ctx, "M77-3.5h1.2v7H77Zm5 0h1.4v7H82Z", "#55493d");
	fill(ctx, "M85-3.4h4q3 0 3 2v2.8q0 2-3 2h-4Z", "#625248");
	fill(ctx, "M85-3.4h4q2 0 2.5 1.15H85Z", "#8d7a68");
}

function drawDust(ctx: CanvasRenderingContext2D) {
	ctx.setLineDash([0.5, 3, 1, 6]);
	stroke(
		ctx,
		"M55 274q55-10 104-8m211 25q69-14 132-18m-328 67q58-2 90-16",
		"#635b51",
		1.1,
	);
}

function drawFieldRocks(ctx: CanvasRenderingContext2D) {
	for (const [top, bottom, body, lip] of [
		[
			414,
			479,
			"M38 476q8-22 22-44l16-11 21-5 20-2 13 5 19 16 13 20 11 23Z",
			"M56 441l16-17 24-7 21-3 13 5 19 16-17-8-13-3-24 1-26 9Z",
		],
		[
			454,
			493,
			"M152 482l11-15 17-11 12-2 12 5 12 8 13 18-39 8Z",
			"M162 467l18-11 12-2 13 5 11 8-23-7-14 3Z",
		],
		[
			441,
			500,
			"M311 498l9-16 19-21 22-12 29-8 17 2 16 9 11 13 8 18-34 17Z",
			"M328 474l15-16 22-11 25-6 17 2 16 9-13-3-21 0-26 7-19 9Z",
		],
	] as const) {
		const stone = ctx.createLinearGradient(0, top, 0, bottom);
		stone.addColorStop(0, "#726351");
		stone.addColorStop(0.33, "#473c31");
		stone.addColorStop(1, "#181512");
		fill(ctx, body, stone);
		fill(ctx, lip, "#8f7d6560");
	}
	drawRock(ctx, "cluster", 7, 466, 0.72);
	drawRock(ctx, "slab", 116, 473, 0.97);
	drawRock(ctx, "slab", 377, 478, 1.27);
	drawRock(ctx, "slab", 231, 398, 0.39);
	drawRock(ctx, "cluster", 499, 366, 0.32);
	drawRock(ctx, "boulder", 934, 360, 0.57);
}

function drawScrub(
	ctx: CanvasRenderingContext2D,
	center: number,
	base: number,
	width: number,
	height: number,
	stemCount: number,
) {
	const light = ctx.createLinearGradient(0, base, 0, base - height);
	light.addColorStop(0, "#29231c");
	light.addColorStop(0.42, "#635849");
	light.addColorStop(1, "#a4957d");
	ctx.strokeStyle = light;
	ctx.lineCap = "round";
	for (let stem = 0; stem < stemCount; stem++) {
		const spread = (stem / (stemCount - 1)) * 2 - 1;
		const reach = 0.52 + ((stem * 17 + 11) % 23) / 46;
		const rise = height * reach * (1 - 0.56 * spread ** 2);
		const root = center + spread * width * 0.18;
		const lean = spread * width * 0.4 + ((stem % 3) - 1) * 5;
		const xAt = (progress: number) => root + lean * progress ** 2;
		ctx.lineWidth = (stem % 3 ? 1.1 : 1.7) * Math.min(1, height / 60);
		ctx.beginPath();
		ctx.moveTo(root, base);
		ctx.quadraticCurveTo(root, base - rise / 2, xAt(1), base - rise);
		for (let branch = 0; branch < 5; branch++) {
			const progress = 0.32 + 0.13 * branch + (stem % 3) * 0.022;
			const x = xAt(progress);
			const y = base - rise * progress;
			const direction = (stem + branch) % 2 ? -1 : 1;
			const length = rise * (0.19 - 0.016 * branch);
			ctx.moveTo(x, y);
			ctx.quadraticCurveTo(
				x + direction * length * 0.6,
				y - length * 0.2,
				x + direction * length * 0.74,
				y - length * 0.72,
			);
		}
		ctx.stroke();
	}
}

function drawLedgeScrub(ctx: CanvasRenderingContext2D) {
	drawScrub(ctx, 935, 364, 150, 89, 19);
}

function drawValleyScrub(ctx: CanvasRenderingContext2D) {
	drawScrub(ctx, 39, 477, 77, 56, 14);
	drawScrub(ctx, 317, 451, 114, 78, 17);
	drawScrub(ctx, 568, 354, 67, 43, 11);
}

function drawFieldTufts(ctx: CanvasRenderingContext2D) {
	drawDesertTufts(ctx, [
		[420, 480, 66, 43],
		[242, 480, 47, 33],
		[214, 400, 35, 23],
		[164, 370, 31, 21],
	]);
}

export const fieldNotesPlants = [
	{ kind: "cactus", x: 12, y: 72, width: 6 },
	{ kind: "cactus", far: true, x: 28, y: 63, width: 2.8 },
	{ kind: "grass", variant: "sparse", x: 7, y: 71, width: 2.4 },
	{ kind: "grass", variant: "leaning", x: 4, y: 77, width: 2.9 },
	{ kind: "grass", variant: "fan", x: 45, y: 78, width: 3.3 },
	{ kind: "grass", variant: "leaning", x: 40, y: 72, width: 2.2 },
] satisfies readonly Plant[];

export const fieldNotesLayers = [
	{ id: "escarpment", label: "Cliffs and valley", draw: drawEscarpment },
	{ id: "valley-folds", label: "Valley folds", draw: drawValleyFolds },
	{ id: "valley-ridge", label: "Low valley ridge", draw: drawValleyRidge },
	{ id: "dust", label: "Dust wisps", draw: drawDust },
	{ id: "lookout-rise", label: "Lookout rise", draw: drawLookoutRise },
	{ id: "trail", label: "Winding trail", draw: drawTrail },
	{ id: "lookout", label: "Stone lookout", draw: drawLookout },
	{ id: "ledge-scrub", label: "Scrub behind the ledge", draw: drawLedgeScrub },
	{ id: "ledge", label: "Foreground ledge", draw: drawLedge },
	{ id: "field-rocks", label: "Foreground rocks", draw: drawFieldRocks },
	{ id: "tufts", label: "Foreground yuccas", draw: drawFieldTufts },
	{ id: "scrub", label: "Valley scrub", draw: drawValleyScrub },
	{ id: "notebook-shadow", label: "Notebook shadow", draw: drawNotebookShadow },
	{ id: "notebook", label: "Notebook", draw: drawNotebook },
	{ id: "pages", label: "Page edges and spine", draw: drawPageEdges },
	{ id: "ink", label: "Handwritten notes", draw: drawHandwrittenNotes },
	{ id: "mesa-sketch", label: "Mesa sketch", draw: drawMesaSketch },
	{ id: "plant-sketch", label: "Plant sketch", draw: drawPlantSketch },
	{ id: "rock-sketch", label: "Rock sketch", draw: drawRockSketch },
	{ id: "pencil-shadow", label: "Pencil shadow", draw: drawPencilShadow },
	{ id: "pencil", label: "Pencil", draw: drawPencil },
] as const;
