import { flameInk, metalInk } from "./materialInk";
import { fill, stroke } from "./canvasShapes";

function drawTowerLattice(ctx: CanvasRenderingContext2D) {
	const leftLeg = (y: number) => 680.4 - (y - 253) * 0.107;
	const rightLeg = (y: number) => 682.5 + (y - 253) * 0.108;
	const lattice = ctx.createLinearGradient(0, 253, 0, 318);
	lattice.addColorStop(0, metalInk("#8c7e69"));
	lattice.addColorStop(0.54, metalInk("#70634f"));
	lattice.addColorStop(1, metalInk("#655a4a"));
	for (let y = 249; y < 317; ) {
		const base = Math.min(y + 6 + (y - 249) * 0.064, 318.5);
		stroke(ctx, `M${leftLeg(y)} ${y}L${rightLeg(base)} ${base}`, lattice, 1.35);
		stroke(
			ctx,
			`M${rightLeg(y)} ${y}L${leftLeg(base)} ${base}`,
			metalInk("#62594b"),
			1.16,
		);
		stroke(ctx, `M${leftLeg(base)} ${base}H${rightLeg(base)}`, lattice, 0.95);
		y = base;
	}
}

function drawTowerSpine(ctx: CanvasRenderingContext2D) {
	const spine = ctx.createLinearGradient(0, 249, 0, 310);
	spine.addColorStop(0, metalInk("#b3a287"));
	spine.addColorStop(0.48, metalInk("#998971"));
	spine.addColorStop(1, metalInk("#63554300"));
	fill(ctx, "M680.3 251h1.9l-.6 58h-1.2Z", spine);
}

function drawTowerShelterBody(ctx: CanvasRenderingContext2D) {
	const steel = ctx.createLinearGradient(639, 301, 670, 315);
	steel.addColorStop(0, metalInk("#4e4235"));
	steel.addColorStop(0.55, metalInk("#6c6050"));
	steel.addColorStop(1, metalInk("#332b22"));
	fill(ctx, "M640 301l15-2.1 14.5 1.7V319H640Z", steel);
}

function drawTowerShelterTrim(ctx: CanvasRenderingContext2D) {
	fill(
		ctx,
		"M654.2 300.4h1.6v18.3h-1.6Zm-14.2 2h1.3v15.8H640Zm28-1h1.3v17H668Z",
		metalInk("#766852"),
	);
	fill(ctx, "M638 318.9h32v1h-32Z", metalInk("#786a54"));
}

function drawTowerJunctionBox(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M693 319v-4l2-2h4v6Z", metalInk("#514638"));
	fill(ctx, "M693 315l2-2h4l-1.3 2Zm4.3 0h1v3.4h-1Z", metalInk("#82745e"));
}

function drawTowerBeacon(ctx: CanvasRenderingContext2D, brightness = 1) {
	if (brightness <= 0) return;
	const bright = brightness > 1;
	ctx.beginPath();
	ctx.arc(681.1, 243, bright ? 3.9 : 2.25, 0, Math.PI * 2);
	ctx.fillStyle = bright ? flameInk("#fff3cb") : flameInk("#f5e8c5");
	ctx.fill();
}

function towerWaves(radius: number, tone: string) {
	return (ctx: CanvasRenderingContext2D, brightness = 1) => {
		if (brightness <= 0) return;
		const spread = 0.73;
		ctx.beginPath();
		for (const angle of [0, Math.PI]) {
			ctx.moveTo(
				681.1 + radius * Math.cos(angle - spread),
				243 + radius * Math.sin(angle - spread),
			);
			ctx.arc(681.1, 243, radius, angle - spread, angle + spread);
		}
		ctx.strokeStyle = tone;
		ctx.lineWidth = 1.2;
		ctx.lineCap = "round";
		ctx.stroke();
	};
}

function towerFace(path: string, color: string) {
	return (ctx: CanvasRenderingContext2D) => fill(ctx, path, color);
}

export const towerAntenna = "tower-antenna";
export const towerSignalLayers = [
	"signal",
	"tower-waves",
	"tower-middle-waves",
	"tower-outer-waves",
] as const;

export const radioTowerDither = [
	{
		path: "M658 227h46v31h-17l8 65h-27l8-65h-18Z",
		left: 658,
		top: 227,
		right: 704,
		bottom: 323,
		pitchScale: 0.59,
		style: "fine",
	},
	{
		path: "M637 297h31v25h-31Z",
		left: 637,
		top: 297,
		right: 668,
		bottom: 322,
		pitchScale: 0.68,
	},
] as const;

export const radioTowerLayers = (
	[
		[
			"tower-foundation",
			"Tower foundation",
			towerFace("M666 319q16-4 31 0l4 2-37 1Z", metalInk("#29251e")),
		],
		["tower-lattice", "Tower lattice", drawTowerLattice],
		["tower-spine", "Tower center spine", drawTowerSpine],
		[
			"tower-west-leg",
			"Tower west leg",
			towerFace("M680.2 249h1.25l-7.3 70h-1.65Z", metalInk("#7e705b")),
		],
		[
			"tower-east-leg",
			"Tower east leg",
			towerFace("M681.8 249h1.25l7.75 70h-1.7Z", metalInk("#776954")),
		],
		[
			towerAntenna,
			"Tower antenna",
			towerFace("M680.5 242h1.3v12h-1.3Z", metalInk("#9a8c75")),
		],
		[
			"tower-footplates",
			"Tower footplates",
			towerFace("M671 317.6h5v2h-5Zm17.3 0h4.8v2h-4.8Z", metalInk("#7f725d")),
		],
		["tower-shelter", "Shelter walls", drawTowerShelterBody],
		[
			"tower-shelter-roof",
			"Shelter roof",
			towerFace(
				"M640 301l15-2.1 14.5 1.7v1.15l-14.5-1.4-15 2Z",
				metalInk("#7d6e59"),
			),
		],
		[
			"tower-shelter-west-door",
			"Shelter west door",
			(ctx: CanvasRenderingContext2D) => {
				fill(ctx, "M642 304l11-1v14l-11 1Z", metalInk("#2e271f"));
				fill(ctx, "M643 307h2v4h-2Zm5.8.5h2.4v2.2h-2.4Z", metalInk("#7c6d57"));
			},
		],
		[
			"tower-shelter-east-door",
			"Shelter east door",
			(ctx: CanvasRenderingContext2D) => {
				fill(ctx, "M657 302.7l10.5.7V317H657Z", metalInk("#2e271f"));
				fill(ctx, "M660 306h3v4h-3Z", metalInk("#7c6d57"));
			},
		],
		["tower-shelter-trim", "Shelter frame and sill", drawTowerShelterTrim],
		["tower-junction-box", "Tower junction box", drawTowerJunctionBox],
		[towerSignalLayers[0], "Tower beacon", drawTowerBeacon],
		[
			towerSignalLayers[1],
			"Inner signal waves",
			towerWaves(7.4, metalInk("#584e41")),
		],
		[
			towerSignalLayers[2],
			"Middle signal waves",
			towerWaves(13, metalInk("#51493d")),
		],
		[
			towerSignalLayers[3],
			"Outer signal waves",
			towerWaves(19.7, metalInk("#524a3f")),
		],
	] as const
).map(([id, label, draw]) => ({ id, label, group: "Radio tower", draw }));
