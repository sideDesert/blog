import { type PointerEvent, useRef } from "react";
import {
	type DrawnSeam,
	drawnSeamPoints,
	type SeamPoint,
	terrainFrame,
} from "./shading";

export function TerrainSeamDrawing({
	ridgeAt,
	onDraw,
}: {
	ridgeAt: (x: number) => number;
	onDraw: (seam: DrawnSeam) => void;
}) {
	const draft = useRef<{ pointer: number; points: SeamPoint[] } | null>(null);
	const preview = useRef<SVGPolylineElement>(null);

	function pointAt(event: PointerEvent<SVGRectElement>): SeamPoint {
		const bounds = event.currentTarget.getBoundingClientRect();
		const x = Math.max(
			0,
			Math.min(1, (event.clientX - bounds.left) / bounds.width),
		);
		const ridge =
			(ridgeAt(x * terrainFrame.width) - terrainFrame.top) /
			terrainFrame.height;
		return {
			x,
			y: Math.min(
				1,
				Math.max(0, ridge, (event.clientY - bounds.top) / bounds.height),
			),
		};
	}

	function start(event: PointerEvent<SVGRectElement>) {
		if (event.button !== 0 || draft.current) return;

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		draft.current = { pointer: event.pointerId, points: [pointAt(event)] };
	}

	function move(event: PointerEvent<SVGRectElement>) {
		const current = draft.current;
		if (!current || current.pointer !== event.pointerId) return;

		const point = pointAt(event);
		const last = current.points[current.points.length - 1];
		if (
			Math.hypot(
				(point.x - last.x) * terrainFrame.aspectRatio,
				point.y - last.y,
			) < 0.009
		)
			return;

		current.points.push(point);
		preview.current?.setAttribute("points", drawnSeamPoints(current.points));
	}

	function clear(event: PointerEvent<SVGRectElement>) {
		if (draft.current?.pointer !== event.pointerId) return;

		draft.current = null;
		preview.current?.removeAttribute("points");
	}

	function finish(event: PointerEvent<SVGRectElement>) {
		const current = draft.current;
		if (!current || current.pointer !== event.pointerId) return;

		move(event);
		clear(event);
		if (current.points.length < 2) return;

		const first = current.points[0];
		const last = current.points[current.points.length - 1];
		const horizontal = (last.x - first.x) * terrainFrame.aspectRatio;
		const vertical = last.y - first.y;
		const direction =
			Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
		const points =
			direction < 0 ? [...current.points].reverse() : current.points;
		onDraw({ points, side: 1 });
	}

	return (
		<g>
			<rect
				className="cursor-crosshair touch-none"
				x={0}
				y={terrainFrame.top}
				width={terrainFrame.width}
				height={terrainFrame.height}
				fill="transparent"
				onPointerDown={start}
				onPointerMove={move}
				onPointerUp={finish}
				onPointerCancel={clear}
				onLostPointerCapture={clear}
			/>
			<polyline
				ref={preview}
				fill="none"
				stroke="var(--foreground)"
				strokeWidth={1.5}
				strokeDasharray="4 3"
				vectorEffect="non-scaling-stroke"
				pointerEvents="none"
			/>
		</g>
	);
}
