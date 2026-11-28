import { useEffect, useMemo, useRef } from "react";
import {
	createSunInk,
	DEFAULT_SUN_PALETTES,
	DEFAULT_SUN_TRAIL_COLORS,
	type SunPalette,
} from "./sun/palette";

export type Circle = {
	x: number;
	y: number;
	r: number;
};

export type SunCircles = {
	A: Circle;
	B: Circle;
	C: Circle;
};

type Point = {
	x: number;
	y: number;
};

type PointerSample = Point & {
	time: number;
};

export type SunProps = {
	circles: SunCircles;
	showBounds?: boolean;
	palette?: SunPalette;
	trailColor?: string;
	label?: "Sun" | "Moon";
	motion: boolean;
	onBrush?: (strength: number) => void;
	className?: string;
};

export const DEFAULT_CIRCLES: SunCircles = {
	A: { x: 42, y: 54, r: 30 },
	B: { x: 50, y: 39, r: 34 },
	C: { x: 47, y: 48, r: 31 },
};

const TRAIL = {
	characters: ".:+*#@",
	lifetime: 1250,
	persistence: 0.35,
	followLag: 200,
	sensitivity: 1.8,
	minRadius: 3,
	maxRadius: 12,
	initialRadius: 4,
	fontSize: 2.75,
};

const HEAT = {
	step: 50,
	variation: 0.4,
};

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

function insideCircle(x: number, y: number, c: Circle) {
	return (x - c.x) ** 2 + (y - c.y) ** 2 <= c.r ** 2;
}

function trailIntensity(strength: number, hit: number, time: number) {
	const age = (time - hit) / TRAIL.lifetime;

	const progress = clamp(
		(age - TRAIL.persistence) / (1 - TRAIL.persistence),
		0,
		1,
	);

	const fade = progress ** 2 * (3 - 2 * progress);

	return strength * (1 - fade);
}

export function CircleControls({
	name,
	circle,
	onChange,
}: {
	name: string;
	circle: Circle;
	onChange: (circle: Circle) => void;
}) {
	return (
		<div className="space-y-2">
			<h3 className="text-[0.69rem] font-bold tracking-[0.16em] text-muted-foreground uppercase [margin:0_0_0.5rem]">
				{name}
			</h3>

			{(["x", "y", "r"] as const).map((key) => (
				<label key={key} className="flex items-center gap-3">
					<span className="w-6">{key}</span>

					<input
						type="range"
						min={key === "r" ? 5 : 0}
						max={key === "r" ? 50 : 100}
						value={circle[key]}
						onChange={(e) =>
							onChange({
								...circle,
								[key]: Number(e.target.value),
							})
						}
					/>

					<span>{circle[key]}</span>
				</label>
			))}
		</div>
	);
}

export default function Sun({
	circles,
	showBounds = false,
	palette = DEFAULT_SUN_PALETTES.lightColor,
	trailColor = DEFAULT_SUN_TRAIL_COLORS.lightColor,
	label = "Sun",
	motion,
	onBrush,
	className,
}: SunProps) {
	const ref = useRef<SVGSVGElement>(null);

	const ink = useMemo(() => createSunInk(palette), [palette]);

	const dots = useMemo(() => {
		const result = [];

		for (let x = 0; x < 100; x += 3) {
			for (let y = 0; y < 100; y += 3) {
				const isInsideA = insideCircle(x, y, circles.A);
				const isInsideB = insideCircle(x, y, circles.B);
				const isInsideC = insideCircle(x, y, circles.C);

				if (!isInsideC) continue;

				const grain = Math.imul(x, 0x1f123bb5) ^ Math.imul(y, 0x5f356495);

				result.push({
					x,
					y,
					key: `${x}-${y}`,
					fill: ink((grain >>> 24) / 640),
					animated: isInsideA !== isInsideB,
				});
			}
		}

		return result;
	}, [circles, ink]);

	// Original sun heat animation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: circles rebuilds the SVG dots queried below
	useEffect(() => {
		const svg = ref.current;

		if (!svg || !motion) return;

		const animatedDots = svg.querySelectorAll<SVGRectElement>(
			'rect[data-animate="true"]',
		);

		const heat = Array.from(animatedDots, () => Math.random());

		let animationId: number;
		let lastUpdate = 0;

		function animate(time: number) {
			if (time - lastUpdate >= HEAT.step) {
				animatedDots.forEach((dot, i) => {
					heat[i] += (Math.random() - 0.5) * HEAT.variation;

					heat[i] = clamp(heat[i], 0, 1);

					dot.style.fill = ink(heat[i]);
				});

				lastUpdate = time;
			}

			animationId = requestAnimationFrame(animate);
		}

		animationId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);

			animatedDots.forEach((dot) => {
				dot.style.removeProperty("fill");
			});
		};
	}, [dots, ink, motion]);

	// Independent ASCII trail animation.
	useEffect(() => {
		const svgElement = ref.current;

		if (!svgElement || !motion) return;

		const elements =
			svgElement.querySelectorAll<SVGTextElement>("text[data-trail]");

		const trailDots = dots.map((dot, i) => ({
			x: dot.x,
			y: dot.y,
			element: elements[i],
			strength: 0,
			hit: -Infinity,
			character: "",
			opacity: 0,
		}));

		let target: Point | null = null;
		let brush: Point | null = null;
		let previous: PointerSample | null = null;

		let velocity: Point = { x: 0, y: 0 };

		let radius = TRAIL.initialRadius;
		let targetRadius = TRAIL.initialRadius;

		let animationId: number;
		let lastFrame = performance.now();

		const getPointer = (event: PointerEvent): Point | null => {
			const matrix = svgElement.getScreenCTM();

			if (!matrix) return null;

			const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
				matrix.inverse(),
			);

			return {
				x: point.x,
				y: point.y,
			};
		};

		function handlePointerMove(event: PointerEvent) {
			const point = getPointer(event);

			if (!point) return;

			const now = performance.now();

			if (!brush) {
				brush = { ...point };
			}

			if (previous) {
				const dt = Math.max(8, now - previous.time);

				const vx = (point.x - previous.x) / dt;
				const vy = (point.y - previous.y) / dt;

				const acceleration = Math.hypot(vx - velocity.x, vy - velocity.y) / dt;

				targetRadius = clamp(
					TRAIL.minRadius + acceleration * 650 * TRAIL.sensitivity,
					TRAIL.minRadius,
					TRAIL.maxRadius,
				);

				velocity = { x: vx, y: vy };
			}

			target = point;

			previous = {
				...point,
				time: now,
			};
		}

		function handlePointerLeave() {
			target = null;
			brush = null;
			previous = null;

			velocity = { x: 0, y: 0 };

			radius = TRAIL.initialRadius;
			targetRadius = TRAIL.initialRadius;
		}

		function paintSegment(from: Point, to: Point, time: number) {
			const dx = to.x - from.x;
			const dy = to.y - from.y;

			const lengthSquared = dx * dx + dy * dy;

			if (lengthSquared <= 0.0025) return;

			let strokeStrength = 0;

			for (const dot of trailDots) {
				const progress = clamp(
					((dot.x - from.x) * dx + (dot.y - from.y) * dy) / lengthSquared,
					0,
					1,
				);

				const nearestX = from.x + progress * dx;
				const nearestY = from.y + progress * dy;

				const distance = Math.hypot(dot.x - nearestX, dot.y - nearestY);

				if (distance >= radius) continue;

				const strength = clamp((1 - distance / radius) * 1.8, 0, 1);

				strokeStrength = Math.max(strokeStrength, strength);

				const existing = trailIntensity(dot.strength, dot.hit, time);

				dot.strength = Math.max(strength, existing);
				dot.hit = time;
			}

			if (strokeStrength > 0.25) {
				onBrush?.(strokeStrength);
			}
		}

		function animate(time: number) {
			const dt = Math.min(50, time - lastFrame);

			lastFrame = time;

			// Smoothly move the brush towards the mouse.
			if (brush && target) {
				const from = { ...brush };

				const factor = 1 - Math.exp(-dt / TRAIL.followLag);

				brush.x += (target.x - brush.x) * factor;
				brush.y += (target.y - brush.y) * factor;

				radius += (targetRadius - radius) * factor;

				paintSegment(from, brush, time);
			}

			// Update only the ASCII overlay.
			for (const dot of trailDots) {
				const intensity = trailIntensity(dot.strength, dot.hit, time);

				if (intensity <= 0.015) {
					if (dot.opacity !== 0) {
						dot.element.style.opacity = "0";
						dot.opacity = 0;
					}

					continue;
				}

				const index = Math.min(
					TRAIL.characters.length - 1,
					Math.floor(intensity * TRAIL.characters.length),
				);

				const character = TRAIL.characters[index];

				const opacity = Math.min(1, intensity * 2);

				if (dot.character !== character) {
					dot.element.textContent = character;
					dot.character = character;
				}

				if (dot.opacity !== opacity) {
					dot.element.style.opacity = String(opacity);
					dot.opacity = opacity;
				}
			}

			animationId = requestAnimationFrame(animate);
		}

		svgElement.addEventListener("pointermove", handlePointerMove);
		svgElement.addEventListener("pointerleave", handlePointerLeave);
		svgElement.addEventListener("pointercancel", handlePointerLeave);

		animationId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);

			svgElement.removeEventListener("pointermove", handlePointerMove);

			svgElement.removeEventListener("pointerleave", handlePointerLeave);

			svgElement.removeEventListener("pointercancel", handlePointerLeave);

			elements.forEach((element) => {
				element.style.opacity = "0";
				element.textContent = "";
			});
		};
	}, [dots, onBrush, motion]);

	return (
		<svg
			ref={ref}
			viewBox="0 0 100 100"
			className={className ?? "w-96"}
			role="img"
			aria-label={label}
		>
			<g>
				{dots.map((dot) => (
					<rect
						key={dot.key}
						x={dot.x - 1}
						y={dot.y - 1}
						width={2}
						height={2}
						fill={dot.fill}
						data-animate={dot.animated}
					/>
				))}
			</g>

			{/* ASCII trail glyphs */}
			<g
				pointerEvents="none"
				fill={trailColor}
				fontFamily="monospace"
				fontWeight="bold"
				fontSize={TRAIL.fontSize}
				textAnchor="middle"
				dominantBaseline="central"
				style={{ userSelect: "none" }}
			>
				{dots.map((dot) => (
					<text
						key={dot.key}
						x={dot.x}
						y={dot.y}
						data-trail=""
						style={{ opacity: 0 }}
					/>
				))}
			</g>

			{/* Debug boundaries */}
			{showBounds &&
				[
					{ ...circles.A, color: "#60a5fa" },
					{ ...circles.B, color: "#c084fc" },
					{ ...circles.C, color: "#4ade80" },
				].map((c) => (
					<circle
						key={c.color}
						cx={c.x}
						cy={c.y}
						r={c.r}
						fill="none"
						stroke={c.color}
						strokeWidth={0.3}
					/>
				))}
		</svg>
	);
}
