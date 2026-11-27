import { fill } from "./canvasShapes";

const rockShapes = {
	boulder: [
		"M0 21 6 10 15 4 27 2 38 7 46 18 48 22Z",
		"M0 21 15 4l8 4 4 12-13 2Z",
		"M23 8 27 2 38 7 32 13l-5 7Z",
	],
	angular: [
		"M0 23l5-14 10-4 8-4 12 3 8 7 3 13-13 1Z",
		"M21 5l14-1 8 7 3 13-10 1-5-9-3-5Z",
		"M5 9l10-4 8-4 12 3 8 7-14-1-15-3Z",
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

export function rockLayer<Id extends string>(
	id: Id,
	label: string,
	[kind, x, y, scale]: readonly [
		keyof typeof rockShapes,
		number,
		number,
		number,
	],
) {
	return {
		id,
		label,
		group: "Small rocks",
		draw(ctx: CanvasRenderingContext2D) {
			drawRock(ctx, kind, x, y, scale);
		},
	};
}

const fanBladeTips = [
	[-0.51, 0.14],
	[-0.49, 0.28],
	[-0.43, 0.43],
	[-0.36, 0.57],
	[-0.27, 0.7],
	[-0.19, 0.87],
	[-0.064, 0.74],
	[0.028, 0.94],
	[0.14, 0.72],
	[0.23, 0.83],
	[0.36, 0.64],
	[0.46, 0.48],
	[0.51, 0.31],
	[0.47, 0.15],
] as const;

export function yuccaLayer<Id extends string>(
	id: Id,
	label: string,
	[x, y, width, height]: readonly [
		x: number,
		y: number,
		width: number,
		height: number,
	],
) {
	return {
		id,
		label,
		group: "Cacti and grasses",
		draw(ctx: CanvasRenderingContext2D, seconds = 0) {
			const light = ctx.createLinearGradient(0, y, 0, y - height);
			light.addColorStop(0, "#48593b");
			light.addColorStop(0.33, "#657c55");
			light.addColorStop(0.7, "#829a69");
			light.addColorStop(1, "#7d9868");
			const gust = Math.sin(seconds * 1.39 + x * 0.018);
			for (const [blade, [spread, reach]] of fanBladeTips.entries()) {
				const flutter = Math.sin(seconds * 2.81 + blade * 0.88 + x * 0.008);
				const bend = height * reach * (gust * 0.16 + flutter * 0.045);
				const tipX = x + spread * width + bend;
				const tipY = y - height * reach;
				const foot = x + spread * width * 0.14;
				const rise = y - tipY;
				const run = tipX - foot;
				const length = Math.hypot(run, rise);
				const middleX = foot + run * 0.59 - bend * 0.27;
				const middleY = y - rise * 0.51;
				const thickness = 0.78 + (blade % 4) * 0.13;
				const normalX = (rise / length) * thickness;
				const normalY = (run / length) * thickness;
				fill(
					ctx,
					`M${foot - normalX * 0.48} ${y - normalY * 0.48}
				Q${middleX - normalX * 1.48} ${middleY - normalY * 1.48} ${tipX} ${tipY}
				Q${middleX + normalX * 1.48} ${middleY + normalY * 1.48} ${foot + normalX * 0.48} ${y + normalY * 0.48}Z`,
					light,
				);
			}
		},
	};
}
