export function stroke(
	ctx: CanvasRenderingContext2D,
	path: string,
	ink: string | CanvasGradient,
	width = 0.8,
) {
	ctx.strokeStyle = ink;
	ctx.lineWidth = width;
	ctx.stroke(new Path2D(path));
}

export function fill(
	ctx: CanvasRenderingContext2D,
	path: string,
	ink: string | CanvasGradient,
) {
	ctx.fillStyle = ink;
	ctx.fill(new Path2D(path));
}

export function fillTerrainContours(
	ctx: CanvasRenderingContext2D,
	contours: readonly (readonly [tone: number, outline: string])[],
	inkForTone = (tone: number) => `rgb(${tone + 4} ${tone} ${tone - 7})`,
) {
	for (const [tone, outline] of contours) {
		ctx.fillStyle = inkForTone(tone);
		ctx.fill(new Path2D(outline), "evenodd");
	}
}
