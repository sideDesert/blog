import { useEffect, useRef } from "react";

const textureWidth = 1230;
const textureHeight = 274;

// Vertical percentages at five evenly spaced positions from left to right.
type CloudHeights = readonly [number, number, number, number, number];

type Cloud = {
	centerX: number;
	patternX: number;
	centerY: number;
	spread: number;
	depth: number;
	drift: number;
	seed: number;
	heights?: CloudHeights;
	opacity?: number;
};

export type CloudPlacement = {
	x: number;
	heights: CloudHeights;
	spread: number;
	depth: number;
	drift: number;
	opacity?: number;
};

const initialClouds: Cloud[] = [
	{ centerX: 37, centerY: 82, spread: 50, depth: 5, drift: -5 },
	{ centerX: 370, centerY: 35, spread: 125, depth: 14, drift: 3 },
	{ centerX: 535, centerY: 108, spread: 113, depth: 11, drift: -4 },
	{ centerX: 733, centerY: 177, spread: 45, depth: 4, drift: 6 },
	{ centerX: 916, centerY: 116, spread: 87, depth: 9, drift: -3 },
	{ centerX: 1002, centerY: 77, spread: 100, depth: 8, drift: 4 },
	{ centerX: 1179, centerY: 61, spread: 36, depth: 5, drift: -2 },
	{ centerX: 1186, centerY: 116, spread: 39, depth: 4, drift: 5 },
].map((cloud) => ({ ...cloud, patternX: cloud.centerX, seed: 0 }));

function createCloud(enterFrom: "left" | "right"): Cloud {
	const spread = textureWidth * (0.03 + Math.random() * 0.07);
	const speed = 2 + Math.random() * 4;
	const centerX =
		enterFrom === "left" ? -spread - 8 : textureWidth + spread + 8;

	return {
		centerX,
		patternX: centerX,
		centerY: textureHeight * (0.12 + Math.random() * 0.55),
		spread,
		depth: 3 + Math.random() * 11,
		drift: enterFrom === "left" ? speed : -speed,
		seed: Math.random() * 1000,
	};
}

function advanceClouds(activeClouds: Cloud[], deltaSeconds: number) {
	for (let index = 0; index < activeClouds.length; index++) {
		const cloud = activeClouds[index];
		cloud.centerX += cloud.drift * deltaSeconds;

		if (cloud.drift < 0 && cloud.centerX + cloud.spread < 0) {
			if (cloud.heights) cloud.centerX = textureWidth + cloud.spread;
			else activeClouds[index] = createCloud("right");
		} else if (cloud.drift > 0 && cloud.centerX - cloud.spread > textureWidth) {
			if (cloud.heights) cloud.centerX = -cloud.spread;
			else activeClouds[index] = createCloud("left");
		}
	}
}

function random(x: number, y: number, seed = 0) {
	const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
	return value - Math.floor(value);
}

function cloudHeight(heights: CloudHeights, horizontal: number) {
	const position = (horizontal + 1) * 2;
	const segment = Math.min(3, Math.floor(position));
	const progress = position - segment;
	const before = heights[Math.max(0, segment - 1)];
	const from = heights[segment];
	const to = heights[segment + 1];
	const after = heights[Math.min(4, segment + 2)];
	const startSlope = (to - before) / 2;
	const endSlope = (after - from) / 2;
	const change = to - from;
	const quadratic = 3 * change - 2 * startSlope - endSlope;
	const cubic = -2 * change + startSlope + endSlope;
	return (
		from + progress * (startSlope + progress * (quadratic + progress * cubic))
	);
}

function drawClouds(
	context: CanvasRenderingContext2D,
	height: number,
	activeClouds: Cloud[],
) {
	for (const {
		centerX,
		patternX,
		centerY,
		spread,
		depth,
		seed,
		heights,
		opacity = 1,
	} of activeClouds) {
		if (centerX + spread < 0 || centerX - spread > textureWidth) continue;

		const rowPitch = heights ? 1.65 : 2.7;
		const columnPitch = heights ? 1.65 : 3.5;
		for (let offsetY = -depth; offsetY <= depth; offsetY += rowPitch) {
			for (let offsetX = -spread; offsetX <= spread; offsetX += columnPitch) {
				const x = centerX + offsetX;
				const textureX = patternX + offsetX;
				const horizontal = offsetX / spread;
				const center = heights
					? cloudHeight(heights, horizontal) / 100
					: centerY / textureHeight;
				const y = center * height + offsetY;
				const taper = Math.max(
					0,
					1 -
						Math.hypot(
							horizontal,
							(offsetY + (heights ? 0 : offsetX * 0.018)) / depth,
						),
				);
				const wisps = 0.6 + 0.4 * Math.sin(offsetX * 0.08 + offsetY * 0.7);

				if (random(textureX, y, seed) > taper * wisps) continue;

				context.globalAlpha =
					opacity *
					(0.22 + taper * 0.55) *
					(0.5 + random(textureX, y, seed + 1) * 0.5);
				context.fillRect(
					x + random(textureX, y, seed + 2),
					y + random(textureX, y, seed + 3) * 0.6,
					0.5 + random(textureX, y, seed + 4) * (heights ? 1.1 : 2),
					0.65 + taper * 0.55,
				);
			}
		}
	}
}

function drawGround(context: CanvasRenderingContext2D, height: number) {
	for (let row = 0; 2 + row * 5.3 < height; row++) {
		const y = 2 + row * 5.3;
		const offset = random(0, row, 7) * 7;
		const depth = y / height;

		for (let x = offset; x < textureWidth; x += 5) {
			const ripple = Math.sin(x * 0.03 + row * 2.7 + Math.sin(x * 0.014) * 2);

			if (random(x, row) > 0.41 + ripple * 0.25) continue;

			context.globalAlpha = 0.09 + random(x, row, 1) ** 2 * (0.3 + depth * 0.3);
			context.fillRect(
				x + random(x, row, 2) * 2,
				y + random(x, row, 3) * 1.5,
				0.5 + random(x, row, 4) ** 3 * 2.9,
				0.65 + random(x, row, 5) * 0.7,
			);
		}
	}
}

export default function DesertTexture({
	layer,
	color,
	clouds,
}: {
	layer: "sky" | "ground";
	color: boolean;
	clouds?: readonly CloudPlacement[];
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) return;

		let drawHeight = 0;
		let previousTime = 0;
		let animationFrame = 0;
		const activeClouds = clouds
			? clouds.map(({ x, heights, spread, depth, drift, opacity }) => ({
					centerX: (x / 100) * textureWidth,
					patternX: (x / 100) * textureWidth,
					centerY: (heights[2] / 100) * textureHeight,
					spread: (spread / 100) * textureWidth,
					depth,
					drift,
					heights,
					opacity,
					seed: 0,
				}))
			: initialClouds.map((cloud) => ({ ...cloud }));

		const paint = () => {
			context.clearRect(0, 0, textureWidth, drawHeight);
			if (layer === "sky") drawClouds(context, drawHeight, activeClouds);
			else drawGround(context, drawHeight);
		};

		const renderFrame = (time: number) => {
			if (previousTime) {
				const deltaSeconds = Math.min((time - previousTime) / 1000, 0.1);
				advanceClouds(activeClouds, deltaSeconds);
			}
			previousTime = time;
			paint();
			animationFrame = requestAnimationFrame(renderFrame);
		};

		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const syncAnimation = () => {
			if (layer !== "sky" || motionQuery.matches) {
				cancelAnimationFrame(animationFrame);
				animationFrame = 0;
				previousTime = 0;
			} else if (!animationFrame) {
				animationFrame = requestAnimationFrame(renderFrame);
			}
		};

		const observer = new ResizeObserver(([{ contentRect }]) => {
			const { width, height } = contentRect;
			if (width === 0 || height === 0) return;

			const pixelRatio = window.devicePixelRatio || 1;
			canvas.width = Math.round(width * pixelRatio);
			canvas.height = Math.round(height * pixelRatio);

			const scale = width / textureWidth;
			context.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, 0, 0);
			context.fillStyle = "#fff";
			drawHeight = height / scale;
			paint();
			syncAnimation();
		});

		observer.observe(canvas);
		motionQuery.addEventListener("change", syncAnimation);

		return () => {
			observer.disconnect();
			motionQuery.removeEventListener("change", syncAnimation);
			cancelAnimationFrame(animationFrame);
		};
	}, [layer, clouds]);

	return (
		<canvas
			ref={canvasRef}
			className="desert-texture absolute inset-0 h-full w-full"
			data-colored={color || undefined}
		/>
	);
}
