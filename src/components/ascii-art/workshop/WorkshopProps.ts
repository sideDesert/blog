function stroke(
	ctx: CanvasRenderingContext2D,
	path: string,
	ink: string,
	width = 0.8,
) {
	ctx.strokeStyle = ink;
	ctx.lineWidth = width;
	ctx.stroke(new Path2D(path));
}

function fill(
	ctx: CanvasRenderingContext2D,
	path: string,
	ink: string | CanvasGradient,
) {
	ctx.fillStyle = ink;
	ctx.fill(new Path2D(path));
}

export function drawRadioTower(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M666 319q16-4 31 0l4 2-37 1Z", "#27231c");
	const leftLeg = (y: number) => 680 - (y - 253) * 0.108;
	const rightLeg = (y: number) => 683 + (y - 253) * 0.101;
	for (let y = 255; y < 319; y += 9) {
		const base = Math.min(y + 9, 319);
		stroke(
			ctx,
			`M${leftLeg(y)} ${y}L${rightLeg(base)} ${base}`,
			"#736553",
			1.25,
		);
		stroke(
			ctx,
			`M${rightLeg(y)} ${y}L${leftLeg(base)} ${base}`,
			"#605747",
			1.05,
		);
		stroke(ctx, `M${leftLeg(y)} ${y}H${rightLeg(y)}`, "#7c6d59", 0.9);
	}
	fill(ctx, "M680 251h1.65l-7.5 68h-2Z", "#8f806b");
	fill(ctx, "M682.1 251h1.5l6.8 68h-1.9Z", "#81715e");
	fill(ctx, "M680.7 242h1.5v12h-1.5Z", "#887c69");
	fill(ctx, "M669 318h7v2h-7Zm18 0h7v2h-7Z", "#887961");
}

export function drawTowerShelter(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M640 301l16-2 12 2v18h-28Z", "#44392e");
	fill(ctx, "M640 301l16-2 12 2v1l-12-1-16 1Z", "#8b7961");
	fill(ctx, "M642 304l11-1v14l-11 1Zm16-1 8 1v13h-8Z", "#28221b");
	fill(ctx, "M655 301h1.8v18H655Zm-15 1h1v17h-1Zm27 0h1v17h-1Z", "#736550");
	fill(ctx, "M643 306h2v4h-2Zm7 1h2v2h-2Zm10-1h3v4h-3Z", "#71614d");
	fill(ctx, "M638 318h31v1.5h-31Zm55 2v-5l2-2h3v7Z", "#665946");
}

export function drawTowerSignal(ctx: CanvasRenderingContext2D, bright = false) {
	ctx.beginPath();
	ctx.arc(681.5, 243, bright ? 3.7 : 1.8, 0, Math.PI * 2);
	ctx.fillStyle = bright ? "#fff3cb" : "#eee2bf";
	ctx.fill();
	stroke(
		ctx,
		"M676 238q-3 5 0 10m11-10q3 5 0 10m-17-14q-6 9 0 18m23-18q6 9 0 18m-29-23q-10 14 0 28m35-28q10 14 0 28",
		"#5d554a",
		0.9,
	);
}

const rockShapes = {
	boulder: [
		"M0 21 6 10 15 4 27 2 38 7 46 18 48 22Z",
		"M0 21 15 4l8 4 4 12-13 2Z",
		"M23 8 27 2 38 7 32 13l-5 7Z",
	],
	slab: [
		"M0 20 7 10 20 4 35 6 47 16 43 22Z",
		"M0 20 7 10 20 4 25 14 15 21Z",
		"m20 4 15 2 12 10-22-2Z",
	],
	cluster: [
		"M0 22 6 15 13 15 18 6 29 3 38 9 42 16 48 17 51 23Z",
		"m13 15 5-9 11-3-4 9 2 10H12Z",
		"m29 3 9 6 4 7-15 6-2-10Z",
	],
};

export function drawRock(
	ctx: CanvasRenderingContext2D,
	kind: keyof typeof rockShapes,
	x: number,
	y: number,
	scale: number,
) {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(scale, scale);
	const [silhouette, litFace, ridge] = rockShapes[kind];
	ctx.save();
	ctx.translate(26, 22);
	ctx.scale(1, 0.19);
	const contact = ctx.createRadialGradient(0, 0, 2, 0, 0, 32);
	contact.addColorStop(0, "#141210");
	contact.addColorStop(1, "#14121000");
	ctx.fillStyle = contact;
	ctx.fillRect(-32, -32, 64, 64);
	ctx.restore();

	const body = ctx.createLinearGradient(21, 3, 26, 23);
	body.addColorStop(0, "#53473a");
	body.addColorStop(0.44, "#31291f");
	body.addColorStop(1, "#1b1815");
	fill(ctx, silhouette, body);

	const face = ctx.createLinearGradient(11, 7, 27, 21);
	face.addColorStop(0, "#8c7960");
	face.addColorStop(0.42, "#594a3b");
	face.addColorStop(1, "#27221b");
	fill(ctx, litFace, face);

	const crest = ctx.createLinearGradient(25, 2, 29, 18);
	crest.addColorStop(0, "#a08b70");
	crest.addColorStop(0.38, "#6c5b47");
	crest.addColorStop(1, "#332820");
	fill(ctx, ridge, crest);
	ctx.save();
	ctx.clip(new Path2D(silhouette));
	for (let index = 0; index < 36; index++) {
		const x = (index * 19) % 49;
		const y = (index * 11) % 24;
		ctx.fillStyle = index % 3 ? "#ac947951" : "#211a165c";
		ctx.fillRect(x, y, index % 4 ? 0.7 : 1.5, 0.55);
	}
	ctx.restore();
	ctx.restore();
}

export function drawRocks(ctx: CanvasRenderingContext2D) {
	for (const [kind, x, y, scale] of [
		["slab", 39, 410, 0.57],
		["boulder", 58, 393, 1.34],
		["cluster", 94, 410, 0.75],
		["slab", 124, 428, 0.42],
		["slab", 231, 421, 0.35],
		["cluster", 291, 438, 0.7],
		["boulder", 308, 433, 0.96],
		["cluster", 345, 445, 0.51],
		["cluster", 735, 447, 0.42],
		["cluster", 749, 433, 0.78],
		["boulder", 769, 409, 1.28],
		["boulder", 808, 423, 0.85],
		["slab", 835, 439, 0.45],
		["slab", 883, 418, 0.42],
	] as const) {
		drawRock(ctx, kind, x, y, scale);
	}
}

export function drawPebbles(ctx: CanvasRenderingContext2D) {
	for (const [left, top, width, depth, count] of [
		[29, 421, 210, 38, 44],
		[251, 446, 213, 18, 46],
		[440, 448, 180, 14, 25],
		[709, 429, 140, 38, 41],
		[851, 420, 98, 20, 20],
	]) {
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
	}
}

export function drawDesertTufts(
	ctx: CanvasRenderingContext2D,
	placements: readonly (readonly [
		x: number,
		y: number,
		width: number,
		height: number,
	])[],
) {
	for (const [x, y, width, height] of placements) {
		const light = ctx.createLinearGradient(0, y, 0, y - height);
		light.addColorStop(0, "#504335");
		light.addColorStop(0.55, "#847561");
		light.addColorStop(1, "#9d8c74");
		for (let blade = 0; blade < 15; blade++) {
			const spread = (blade - 7) / 7;
			const reach = 0.55 + ((blade * 11 + 7) % 17) / 33;
			const tipX = x + spread * width * (0.32 + 0.2 * reach);
			const tipY = y - height * reach * (1 - spread ** 2 * 0.62);
			const foot = x + spread * width * 0.17;
			const middle = (foot + tipX) / 2;
			const thickness = 1.1 + (blade % 3) * 0.27;
			fill(
				ctx,
				`M${foot - thickness} ${y}Q${middle} ${tipY + height * 0.25} ${tipX} ${tipY}
				Q${middle + thickness} ${tipY + height * 0.37} ${foot + thickness} ${y}Z`,
				light,
			);
		}
	}
}

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
	wood.addColorStop(0, "#5a4b3c");
	wood.addColorStop(1, "#30271f");
	fill(ctx, `M0 2h${width}v${height - 2}H0Z`, wood);
	fill(ctx, `M0 2l${depth}-2h${width}l-${depth} 2Z`, "#72614d");
	fill(ctx, `M${width} 2l${depth}-2v${height - 2}l-${depth} 2Z`, "#282019");
	fill(ctx, `M${rail} 4h${width - rail * 2}v${height - 6}H${rail}Z`, "#403227");
	fill(
		ctx,
		`M0 2h${rail}v${height - 2}H0Z
		M${width - rail} 2h${rail}v${height - 2}h-${rail}Z
		M0 ${height - 1.5}h${width}v1.5H0Z`,
		"#6c5b48",
	);
	if (height > 12) {
		fill(ctx, `M2 6h${width - 4}v1.2H2Zm0 5h${width - 4}v.8H2Z`, "#584838");
		fill(ctx, `M${width / 2 - 2} 5h4v2.2h-4Z`, "#88745b");
	}
	ctx.restore();
}

export function drawShelves(ctx: CanvasRenderingContext2D) {
	stroke(ctx, "M338 405v-67h37v67m-37-49h37m-37 18h37m-37 18h37", "#786752");
	for (const [x, y, width, height] of [
		[341, 346, 8, 9],
		[354, 349, 13, 6],
		[344, 365, 12, 8],
		[357, 382, 12, 9],
		[338, 394, 12, 10],
		[356, 393, 14, 11],
	]) {
		drawCrate(ctx, x, y, width, height);
	}
}

export function drawWorkbench(ctx: CanvasRenderingContext2D) {
	const wood = ctx.createLinearGradient(0, 382, 0, 414);
	wood.addColorStop(0, "#81705a");
	wood.addColorStop(0.36, "#695a47");
	wood.addColorStop(1, "#524637");
	fill(
		ctx,
		"M394 383h134v4.5H394ZM421 387h5v25l-5 1ZM522 387h4.5v24H522Z",
		wood,
	);
	fill(ctx, "M394 383l5-2.5h128l1 2.5Z", "#776850");
	fill(
		ctx,
		"M394 387h134v1.2H394Zm26 1h1.4v25H420Zm101 0h1.5v23H521Z",
		"#362d23",
	);
	fill(ctx, "M423.5 389h1.2v21h-1.2Zm100.5 0h1.3v21H524Z", "#8b7b63");
	for (const [x, width] of [
		[399, 7],
		[409, 3],
		[429, 4],
		[448, 10],
		[468, 6],
		[482, 5],
		[513, 4],
	]) {
		fill(ctx, `M${x} 384.5h${width}v.9h-${width}Z`, "#4a392b99");
	}
}

export function drawWorkbenchShadow(ctx: CanvasRenderingContext2D) {
	ctx.translate(473, 410);
	ctx.scale(1, 0.13);
	const contact = ctx.createRadialGradient(0, 0, 1, 0, 0, 74);
	contact.addColorStop(0, "#14110dc0");
	contact.addColorStop(0.55, "#17130f86");
	contact.addColorStop(1, "#17130f00");
	ctx.fillStyle = contact;
	ctx.fillRect(-74, -74, 148, 148);
}

export function drawBenchRadio(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M402 382v-13l3-2h22v15Z", "#554736");
	fill(ctx, "M407 369h19v12h-19Z", "#29231c");
	fill(ctx, "M404 368h23v1.2h-23Zm2 2h1v11h-1Zm19 0h1v11h-1Z", "#8f7d64");
	fill(
		ctx,
		"M410 372h9v2h-9Zm0 4h3v2h-3Zm5 0h3v2h-3Zm6-4h3v2h-3Zm0 5h3v2h-3Z",
		"#9d8a6d",
	);
}

const benchContainers = [
	[431, 6, 4],
	[437, 8, 4.2],
	[444, 11, 4],
	[449, 6, 3.2],
	[458, 5.5, 4.3],
	[465, 10.5, 4.4],
	[471, 7.5, 4],
	[478, 10, 4.8],
	[486, 7.5, 4],
	[518, 8, 4.5],
] as const;

export function drawBenchSupplies(ctx: CanvasRenderingContext2D) {
	for (const [index, [x, height, width]] of benchContainers.entries()) {
		const top = 382 - height;
		const neck = width * 0.27;
		const left = x - width / 2;
		const right = x + width / 2;
		const shoulder = index % 3 ? 2.6 : 1.2;
		fill(
			ctx,
			`M${left} 382v-${height - shoulder}l${width / 2 - neck} -${shoulder}h${2 * neck}L${right} ${top + shoulder}v${height - shoulder}Z`,
			index % 3 ? "#695a47" : "#544735",
		);
		fill(ctx, `M${x - neck} ${top}h${2 * neck}v1.3h-${2 * neck}Z`, "#a29173");
		fill(
			ctx,
			`M${left + 0.6} ${top + shoulder + 1}h.85v${Math.max(1, height - shoulder - 2.6)}h-.85Z`,
			"#bcaa887d",
		);
	}
}

const toolHeads = {
	openWrench:
		"M-.4-1h.8v.8Q2.1 0 2 2.8h-.85L.7 1.3h-1.4l-.45 1.5H-2Q-2.1 0-.4-.2Z",
	ringWrench:
		"M0-.3a1.65 2.05 0 1 0 0 4.1 1.65 2.05 0 1 0 0-4.1Zm0 .94a.76 1.1 0 1 1 0 2.2.76 1.1 0 1 1 0-2.2Z",
	pliers:
		"M-.45-.8h.9v.6l1.2 1.5.35 2h-.95l-1.05-1.8-1.05 1.8H-2l.35-2 1.2-1.5Z",
	hammer: "M-.5-1h1v1l1.95.4v2.1h-1l-.45-.8-3 .25V.2L-.5 0Z",
	driver: "M-.45-1h.9v1.2l.6.75v3q-1.05 1-2.1 0v-3l.6-.75Z",
};

const hangingTools = [
	[394.5, 18, "ringWrench"],
	[400.5, 20, "driver"],
	[407, 15, "openWrench"],
	[413.5, 16, "openWrench"],
	[419.5, 16, "driver"],
	[425.5, 15, "openWrench"],
	[432.5, 13, "pliers"],
	[439, 8, "openWrench"],
	[445.5, 12, "ringWrench"],
	[452, 16, "pliers"],
	[458, 12, "driver"],
	[465, 19, "openWrench"],
	[501, 15, "hammer"],
] as const;

export function drawToolRack(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M389 338h119v1.15H389Z", "#33291f");
	for (const [x, length, head] of hangingTools) {
		const y = 339;
		fill(ctx, `M${x - 1} ${y - 0.8}h2v2h-2Z`, "#5c5146");
		const handle = ctx.createLinearGradient(0, y, 0, y + length);
		handle.addColorStop(0, "#5b5145");
		handle.addColorStop(0.6, "#726554");
		handle.addColorStop(1, "#665a4a");
		fill(ctx, `M${x - 0.8} ${y}h1.6v${length}h-1.6Z`, handle);
		ctx.save();
		ctx.translate(x, y + length);
		ctx.fillStyle = "#716352";
		ctx.fill(new Path2D(toolHeads[head]), "evenodd");
		ctx.restore();
	}
}

export function drawLamplight(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.translate(447, 415);
	ctx.scale(1, 0.18);
	const spill = ctx.createRadialGradient(12, -8, 0, 0, 0, 155);
	spill.addColorStop(0, "#c6aa82a8");
	spill.addColorStop(0.38, "#bda17991");
	spill.addColorStop(0.74, "#ae936b36");
	spill.addColorStop(1, "#ae936b00");
	ctx.fillStyle = spill;
	ctx.fillRect(-155, -155, 310, 310);
	ctx.restore();

	const glow = ctx.createRadialGradient(472, 342, 0, 472, 350, 45);
	glow.addColorStop(0, "#cfb18485");
	glow.addColorStop(0.5, "#b99a6b4d");
	glow.addColorStop(1, "#b99a6b00");
	fill(ctx, "M454 339q18 4 36 0l21 50q-39 10-78 0Z", glow);
}

export function drawLamp(ctx: CanvasRenderingContext2D) {
	stroke(ctx, "M471 313v15h3v3", "#86745e", 1.2);
	const shade = ctx.createLinearGradient(0, 326, 0, 341);
	shade.addColorStop(0, "#544636");
	shade.addColorStop(0.64, "#695741");
	shade.addColorStop(1, "#b7a282");
	fill(ctx, "M468 328h8q9 3 14 12-19 5-36 0 5-9 14-12Z", shade);
	fill(ctx, "M454 339q17 1 36 0l-2 3q-16 4-32 0Z", "#dcd0b4");
	fill(ctx, "M464 339q9-1 17 0l-2 2h-14Z", "#f5ead3");
}

export function drawAwningSupports(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M643 340h2.6v66H643ZM565 351h2v48h-2Zm48-10h2v47h-2Z", "#4d4334");
	fill(ctx, "M643 342h1v60h-1Zm-3 64 3-5 5 1 4 6-12 1Z", "#766756");
	stroke(ctx, "M645 342q9 33 21 60m-22-65v6m-30-4v6", "#71644f", 0.7);
}

export function drawAwning(ctx: CanvasRenderingContext2D) {
	const cloth = new Path2D(
		"M556 323c21 23 55 34 89 20-17 13-33 19-48 19-18 1-31-14-41-39Z",
	);
	const fabric = ctx.createLinearGradient(582, 333, 605, 365);
	fabric.addColorStop(0, "#655747");
	fabric.addColorStop(0.52, "#766751");
	fabric.addColorStop(1, "#645441");
	ctx.fillStyle = fabric;
	ctx.fill(cloth);

	ctx.save();
	ctx.clip(cloth);
	fill(
		ctx,
		`M555 323q21 19 45 23l-3 6q-21-1-34-13Z
		M572 354q35 10 73-10l-17 13q-31 15-48 8Z`,
		"#45392db4",
	);
	fill(
		ctx,
		`M559 332q35 35 83 13-7 6-17 10-35 18-64-17Z
		M568 342q22 14 48 10l-6 2q-25 7-42-9Z`,
		"#ac987958",
	);
	ctx.restore();
}

export function drawHangingRope(ctx: CanvasRenderingContext2D) {
	stroke(
		ctx,
		"M519 340c-4-3-10 1-11 8-2 6 0 10 6 10s9-7 7-13Z",
		"#4a3d30",
		3.2,
	);
	ctx.setLineDash([1.3, 0.75, 0.6, 0.8]);
	stroke(ctx, "M517 340c-4 0-8 5-8 10s2 8 7 7 7-8 4-13Z", "#8f7c63", 1.7);
	ctx.setLineDash([]);
	stroke(ctx, "M517 339l1-3m4 33q4 2 6-2v-11", "#65523f", 0.8);
}

export function drawCableSpool(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M493 368q8-2 18 0l-4 3v10l3 2h-18l5-2v-10Z", "#62513e");
	fill(ctx, "M494 368q9-2 16 0l-1 1h-14Zm2 13h11l3 2h-18Z", "#a79375");
	stroke(
		ctx,
		"M497 372q5 1 10 0m-10 2q5 1 10 0m-10 2q5 1 10 0m-10 2q5 1 10 0",
		"#7d6b54",
	);
}

export function drawFloorCable(ctx: CanvasRenderingContext2D) {
	const cable =
		"M505 382c9 0 1 19 6 29 7 17 41 12 62 14 14 1 12 3-2 4-15 2-14 5 14 7 22 1 43-1 49-4";
	stroke(ctx, cable, "#292019", 2.6);
	stroke(ctx, cable, "#a18b68", 1.2);
	stroke(
		ctx,
		"M510 382c8 1 1 24 8 32 6 8 24 8 46 10m-57-41c5 0-1 16 3 28 2 6 8 10 14 11",
		"#887658",
		0.85,
	);
}

export function drawWorkshopFrame(ctx: CanvasRenderingContext2D) {
	const interior = ctx.createLinearGradient(0, 303, 0, 416);
	interior.addColorStop(0, "#151311");
	interior.addColorStop(0.8, "#191612");
	interior.addColorStop(1, "#1c1814");
	fill(ctx, "M330 307l45-25 178 33v94l-222 1Z", interior);

	const braces = ctx.createLinearGradient(0, 313, 0, 351);
	braces.addColorStop(0, "#665849");
	braces.addColorStop(1, "#544739");
	fill(
		ctx,
		`M332 343l20-22 8-2-28 31Z
		M368 319l13 22-3 5-16-26Z
		M383 341l23-25h7l-30 31Z
		M527 316l25 25v5l-32-30Z`,
		braces,
	);
	for (const [x, y, bottom, width] of [
		[329, 307, 406, 4],
		[379, 285, 409, 5.5],
		[548, 314, 408, 5],
	] as const) {
		const post = ctx.createLinearGradient(x, 0, x + width, 0);
		post.addColorStop(0, "#3c332a");
		post.addColorStop(0.44, "#66584a");
		post.addColorStop(0.72, "#907f69");
		post.addColorStop(1, "#54493c");
		fill(ctx, `M${x} ${y}h${width}v${bottom - y}h-${width}Z`, post);
		fill(
			ctx,
			`M${x - 3} ${bottom}l3-5h${width}l4 5-2 3h-${width + 5}Z`,
			"#685b49",
		);
		for (const offset of [30, 55, 74]) {
			fill(
				ctx,
				`M${x + 1} ${y + offset}h${width - 1}v1.3h-${width - 1}Z`,
				"#29231c80",
			);
		}
	}
}

export function drawRoofTruss(ctx: CanvasRenderingContext2D) {
	const rafter = ctx.createLinearGradient(0, 285, 0, 322);
	rafter.addColorStop(0, "#665748");
	rafter.addColorStop(1, "#4c4135");
	fill(
		ctx,
		`M320 307l49-23 8 0 183 27-2 3-183-26-51 22Z
		M328 310l47-19 178 25v4l-177-25-47 19Z
		M331 315l48-2 173 2v4l-172-2-48 2Z
		M351 302h2.5v15h-2.5Zm23-10 2-1 0.5 22h-2.5Zm28 4 2.5 1v14H402Zm14 1 2.5 1v14H416Z
		M339 308l5-2 12 10-2 1Zm16 5 16-19 3-1-15 20Zm34-17 17 14-3 1-17-16Z`,
		rafter,
	);
	fill(
		ctx,
		"M321 307l49-23 7 0 183 27-2 1-183-26-50 22Zm10 8 48-2 173 2v1l-172-1-49 2Z",
		"#ab987e50",
	);
}

export function drawLeanTo(ctx: CanvasRenderingContext2D) {
	const shade = ctx.createLinearGradient(0, 329, 0, 404);
	shade.addColorStop(0, "#171410");
	shade.addColorStop(0.75, "#181411c0");
	shade.addColorStop(1, "#15121080");
	fill(ctx, "M218 344l48-15 39-1v73l-86 2Z", shade);

	fill(ctx, "M212 340l53-15 46 1-2 3-42-1-54 14Z", "#796a56");
	fill(ctx, "M218 343l49-13 40 1v2l-40-1-49 13Z", "#554838");
	fill(
		ctx,
		`M218 356l14-14 4-1-18 21Z
		M247 358l13-17 2.5-.7-15.5 22Z
		M254 332l13 15v4l-16-17Z
		M268 348l12-16 3.5.2-15.5 20Z
		M290 331h3l12 17v4Z`,
		"#594c3d",
	);
	for (const [x, top, base, width, light] of [
		[217, 343, 399, 3, "#72634f"],
		[247, 338, 388, 2.5, "#504537"],
		[264.5, 327, 403, 4, "#93816b"],
		[302, 330, 398, 3.6, "#675846"],
	] as const) {
		const face = ctx.createLinearGradient(x, 0, x + width, 0);
		face.addColorStop(0, "#30271e");
		face.addColorStop(0.55, light);
		face.addColorStop(1, "#594d3e");
		fill(ctx, `M${x} ${top}h${width}v${base - top}h-${width}Z`, face);
		fill(ctx, `M${x - 2} ${base + 2}l2-3h${width}l2 3Z`, "#645644");
	}
	fill(
		ctx,
		"M264 328h5v2.3h-5Zm39 2h4v1.5h-4Zm-85 14h3v1h-3Zm46 53h5v1.8h-5Z",
		"#a28f786b",
	);
}

export function drawStorageCrates(ctx: CanvasRenderingContext2D) {
	for (const [x, y, width, height] of [
		[250, 372, 14, 13],
		[272, 372, 17, 14],
		[232, 384, 11, 18],
		[244, 386, 19, 17],
		[270, 385, 25, 18],
		[340, 398, 13, 13],
		[388, 394, 12, 19],
	]) {
		drawCrate(ctx, x, y, width, height);
	}
}

export function drawDrawerCabinet(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M427 390h20l4 3v18h-25Z", "#554839");
	fill(ctx, "M427 390h20l4 3h-23Z", "#6e5e4d");
	fill(ctx, "M429 394h19v7h-19Zm0 9h19v7h-19Z", "#29221a");
	fill(ctx, "M430 394h18v1h-18Zm0 9h18v1h-18Z", "#78664f");
	fill(ctx, "M437 397h4v1.6h-4Zm0 9h4v1.6h-4Z", "#a48f6f");
	fill(ctx, "M426 411h25v1.5h-25Z", "#5b4b3b");
}

export function drawUnderBenchBins(ctx: CanvasRenderingContext2D) {
	drawCrate(ctx, 455, 405, 8, 6);
	drawCrate(ctx, 467, 403, 9, 8);
	drawCrate(ctx, 480, 399, 9, 12);
	drawCrate(ctx, 491, 396, 13, 15);
}

export function drawEquipmentCases(ctx: CanvasRenderingContext2D) {
	for (const [x, y, width, height, catchLeft, catchRight] of [
		[316, 390, 30, 21, 8, 23],
		[580, 390, 45, 21, 8, 34],
	]) {
		const base = y + height;
		fill(
			ctx,
			`M${x} ${y}l4-3h${width - 4}v${height + 3}h-${width}Z`,
			"#504334",
		);
		fill(ctx, `M${x} ${y}l4-3h${width - 4}v1.8h-${width - 4}l-4 2Z`, "#807058");
		fill(
			ctx,
			`M${x + 2} ${y + 3}h${width - 4}v${height - 5}h-${width - 4}Z`,
			"#42362c",
		);
		fill(
			ctx,
			`M${x} ${base - 1.6}h${width}v1.6h-${width}Z
			M${x + 1} ${y + 2}h1.25v${height - 3}h-1.25Z
			M${x + width - 2.5} ${y + 1}h1.25v${height - 2}h-1.25Z
			M${x + width * 0.66} ${y + 3}h1.5v${height - 4}h-1.5Z`,
			"#766650",
		);
		for (const catchOffset of [catchLeft, catchRight]) {
			fill(ctx, `M${x + catchOffset} ${y + 1}h2.6v4.2h-2.6Z`, "#928167");
		}
		fill(
			ctx,
			`M${x + 4} ${y + 7}h${width - 8}v1h-${width - 8}Z
			M${x + width * 0.66 - 2} ${y + 8}h1v${height - 11}h-1Z`,
			"#625343",
		);
	}
}
