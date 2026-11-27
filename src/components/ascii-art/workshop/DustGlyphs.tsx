import type { PointerEvent } from "react";
import { workshopHeight, workshopWidth } from "./ditherCanvas";
import type { DustPatch } from "./scenes";

export function stirDust(event: PointerEvent<HTMLDivElement>) {
	if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

	const scene = event.currentTarget;
	const { left, top, width, height } = scene.getBoundingClientRect();
	const pointerX = ((event.clientX - left) / width) * workshopWidth;
	const pointerY = ((event.clientY - top) / height) * workshopHeight;

	for (const patch of scene.querySelectorAll<HTMLElement>(
		"[data-dust-patch]",
	)) {
		const deltaX = Number(patch.dataset.x) - pointerX;
		const deltaY = Number(patch.dataset.y) - pointerY;
		const proximity = 1 - Math.hypot(deltaX, deltaY * 1.4) / 72;
		if (proximity <= 0) {
			patch.removeAttribute("data-stirred");
			continue;
		}

		const lift = proximity * (2 - proximity);
		const drift = lift * Math.max(-1, Math.min(1, deltaX / 26));
		patch.style.setProperty("--dust-lift", lift.toFixed(2));
		patch.style.setProperty("--dust-drift", drift.toFixed(2));
		patch.setAttribute("data-stirred", "");
	}
}

export function settleDust(event: PointerEvent<HTMLDivElement>) {
	for (const patch of event.currentTarget.querySelectorAll("[data-stirred]")) {
		patch.removeAttribute("data-stirred");
	}
}

export function DustGlyphs({ patches }: { patches: readonly DustPatch[] }) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			{patches.map(({ id, x, y, mark }) => (
				<div
					key={id}
					className="workshop-dust"
					data-dust-patch={id}
					data-x={x}
					data-y={y}
					style={{
						left: `${(x / workshopWidth) * 100}%`,
						top: `${(y / workshopHeight) * 100}%`,
					}}
				>
					<span>.</span>
					<span>{mark}</span>
					<span>~</span>
					<span>'</span>
				</div>
			))}
		</div>
	);
}
