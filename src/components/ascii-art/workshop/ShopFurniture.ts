import { metalInk, woodInk } from "./materialInk";
import { fill } from "./canvasShapes";

type DrawPiece = (ctx: CanvasRenderingContext2D) => void;

function furnitureLayers<Id extends string>(
	group: string,
	parts: readonly (readonly [id: Id, label: string, draw: DrawPiece])[],
) {
	return parts.map(([id, label, draw]) => ({ id, label, group, draw }));
}

function shelfBoard(y: number): DrawPiece {
	return (ctx) => {
		fill(ctx, `M338 ${y}l3-2h34l2 2-1 2h-38Z`, woodInk("#534639"));
		const edge = ctx.createLinearGradient(0, y, 0, y + 2.3);
		edge.addColorStop(0, woodInk("#665746"));
		edge.addColorStop(1, woodInk("#544638"));
		fill(ctx, `M339 ${y}h37v2.3h-37Z`, edge);
	};
}

function shelfUpright(x: number, y: number, width: number): DrawPiece {
	return (ctx) => {
		const edge = ctx.createLinearGradient(x, 0, x + width, 0);
		edge.addColorStop(0, woodInk("#4c4034"));
		edge.addColorStop(0.55, woodInk("#6f6050"));
		edge.addColorStop(1, woodInk("#54483c"));
		fill(ctx, `M${x} ${y}h${width}V405h-${width}Z`, edge);
	};
}

export const shelfFrameLayers = furnitureLayers("Shelf frame", [
	[
		"shelf-cap",
		"Shelf cap",
		(ctx) => fill(ctx, "M343 340l3-1h24l2 1-2 1h-27Z", woodInk("#564a3e")),
	],
	["upper-shelf", "Upper shelf", shelfBoard(355)],
	["lower-shelf", "Lower shelf", shelfBoard(379)],
	["shelf-left-upright", "Left shelf upright", shelfUpright(347, 347, 2.9)],
	["shelf-right-upright", "Right shelf upright", shelfUpright(365.7, 345, 2.8)],
]);

function drawBenchTop(ctx: CanvasRenderingContext2D) {
	const wood = ctx.createLinearGradient(394, 385, 530, 382);
	wood.addColorStop(0, woodInk("#625442"));
	wood.addColorStop(0.4, woodInk("#786751"));
	wood.addColorStop(0.74, woodInk("#81705a"));
	wood.addColorStop(1, woodInk("#6e5e4c"));
	fill(ctx, "M394 382.5h134v4.5H394Z", wood);
	fill(ctx, "M394 382.5l5-3h128l1 3Z", woodInk("#786851"));
	fill(ctx, "M394 387h134v1.2H394Z", woodInk("#362d23"));
	for (const [x, width] of [
		[399, 7],
		[409, 3],
		[429, 4],
		[448, 10],
		[468, 6],
		[482, 5],
		[513, 4],
	]) {
		fill(ctx, `M${x} 384.5h${width}v.9h-${width}Z`, woodInk("#4a392b99"));
	}
}

function workbenchLeg(x: number, bottom: number): DrawPiece {
	return (ctx) => {
		const wood = ctx.createLinearGradient(x, 387, x + 5.6, 407);
		wood.addColorStop(0, woodInk("#625341"));
		wood.addColorStop(0.45, woodInk("#786850"));
		wood.addColorStop(1, woodInk("#514437"));
		fill(ctx, `M${x} 387h4.5V${bottom - 1}l-4.5 1Z`, wood);
		fill(ctx, `M${x - 1} 388h1V${bottom}h-1Z`, woodInk("#362d23"));
	};
}

export const workbenchLayers = furnitureLayers("Workbench", [
	["bench", "Workbench top", drawBenchTop],
	["bench-left-leg", "Workbench left leg", workbenchLeg(421, 413)],
	["bench-right-leg", "Workbench right leg", workbenchLeg(522, 411)],
]);

function drawRadioCase(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M403 382v-13l5-1.5h18v14.5Z", metalInk("#382e24"));
	fill(ctx, "M403 369l5-1.5v14.5h-5Z", metalInk("#5e503f"));
	fill(
		ctx,
		"M404.5 371h2v1.1h-2Zm0 2.6h2v1h-2Zm0 2.7h2v1h-2Z",
		metalInk("#342b22"),
	);
}

function drawRadioFace(ctx: CanvasRenderingContext2D) {
	const metal = ctx.createLinearGradient(0, 368, 0, 382);
	metal.addColorStop(0, metalInk("#a18d74"));
	metal.addColorStop(0.39, metalInk("#8d7b64"));
	metal.addColorStop(1, metalInk("#665747"));
	fill(ctx, "M408 368h18.5v14H408Z", metal);
	fill(ctx, "M409.5 369H425v11h-15.5Z", metalInk("#2c241d"));
	fill(ctx, "M409 379.9h16.4v1.25H409Z", metalInk("#88745e"));
}

function drawRadioDial(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M410.5 371h13.4v4.1h-13.4Z", metalInk("#675746"));
	fill(ctx, "M411.3 372h11.8v1.1h-11.8Z", metalInk("#97856d"));
	fill(
		ctx,
		"M412.7 371.5h.8v2.3h-.8Zm3.4 0h.7v2.3h-.7Zm5.3 0h.8v2.3h-.8Z",
		metalInk("#514234"),
	);
}

function radioKnob(x: number, size: number): DrawPiece {
	return (ctx) => {
		fill(ctx, `M${x} 376h${size}v3h-${size}Z`, metalInk("#695846"));
		fill(ctx, `M${x + 0.2} 376.2h1.1v1.6h-1.1Z`, metalInk("#ae997c"));
	};
}

export const benchRadioLayers = furnitureLayers("Workbench radio", [
	["bench-radio", "Radio enclosure", drawRadioCase],
	["bench-radio-face", "Radio faceplate", drawRadioFace],
	["bench-radio-dial", "Radio tuning scale", drawRadioDial],
	["bench-radio-left-knob", "Radio left knob", radioKnob(411, 2.9)],
	["bench-radio-center-knob", "Radio center knob", radioKnob(416.3, 2.2)],
	["bench-radio-right-knob", "Radio right knob", radioKnob(421.5, 2.3)],
]);

function drawCabinetBody(ctx: CanvasRenderingContext2D) {
	fill(ctx, "M428 393h20l2.7 2v16.6h-24Z", woodInk("#33291f"));
	fill(ctx, "M428 392.85h20l.7 1.05h-21.4Z", woodInk("#766451"));
	fill(ctx, "M427 395h1.4v15H427Zm22 0h1.4v15H449Z", woodInk("#72604e"));
}

function cabinetDrawer(y: number, height: number): DrawPiece {
	return (ctx) => {
		const front = ctx.createLinearGradient(0, y, 0, y + height);
		front.addColorStop(0, woodInk("#42372b"));
		front.addColorStop(0.4, woodInk("#2b231b"));
		front.addColorStop(1, woodInk("#201a15"));
		fill(ctx, `M430 ${y}h19v${height}H430Z`, front);
		fill(ctx, `M429 ${y}h20.5v1.05H429Z`, woodInk("#89765e"));
		fill(ctx, `M429 ${y + height - 0.8}h20v0.9H429Z`, woodInk("#7a6854"));
	};
}

function drawerPull(y: number): DrawPiece {
	return (ctx) => {
		fill(ctx, `M437.8 ${y}h4.3v1.9h-4.3Z`, metalInk("#a69075"));
		fill(ctx, `M438.1 ${y + 1.7}h3.7v.8h-3.7Z`, metalInk("#524336"));
	};
}

export const cabinetLayers = furnitureLayers("Drawer cabinet", [
	["drawer-cabinet", "Cabinet body", drawCabinetBody],
	["cabinet-upper-drawer", "Upper drawer", cabinetDrawer(396, 5.9)],
	["cabinet-lower-drawer", "Lower drawer", cabinetDrawer(403.2, 7.8)],
	["cabinet-upper-pull", "Upper drawer pull", drawerPull(398)],
	["cabinet-lower-pull", "Lower drawer pull", drawerPull(406.9)],
]);
