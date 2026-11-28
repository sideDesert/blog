import { type ReactNode, useId } from "react";
import { monochromeNightInks } from "../ditherGlyphs";
import type { TerrainScene } from "./geometry";
import { evaluateShape, samples } from "./geometry";
import type { TerrainConfig, ViewSettings } from "./model";
import { TerrainSeamDrawing } from "./SeamDrawing";
import {
	type DrawnSeam,
	drawnSeamPoints,
	seamPoints,
	terrainFrame,
} from "./shading";

const sandstoneNightInks = [
	"var(--desert-sand-shadow)",
	"var(--desert-sand-deep)",
	"var(--desert-sand-muted)",
	"var(--desert-sand)",
	"var(--desert-sand-rim)",
	"var(--desert-sand-highlight)",
] as const;

export function TerrainArtwork({
	scene,
	color,
	children,
	decorative = false,
}: {
	scene: Pick<TerrainScene, "dotPaths" | "silhouette">;
	color: boolean;
	children?: ReactNode;
	decorative?: boolean;
}) {
	const clipId = useId();
	const gradientId = `${clipId}-ink`;
	const lightInkClass = `dark:hidden ${color ? "fill-(--desert-sand-deep)" : ""}`;
	const nightInks = color ? sandstoneNightInks : monochromeNightInks;

	return (
		<svg
			role={decorative ? undefined : "img"}
			aria-label={decorative ? undefined : "Terrain artwork"}
			aria-hidden={decorative || undefined}
			className="absolute inset-0 block h-full w-full"
			viewBox={`0 ${terrainFrame.top} ${terrainFrame.width} ${terrainFrame.height}`}
			preserveAspectRatio="none"
			style={{ aspectRatio: terrainFrame.aspectRatio }}
		>
			{scene.dotPaths ? (
				<>
					<defs>
						<clipPath id={clipId}>
							<polygon points={scene.silhouette} />
						</clipPath>
						<linearGradient
							id={gradientId}
							gradientUnits="userSpaceOnUse"
							x1="0"
							x2="0"
							y1={terrainFrame.top}
							y2={terrainFrame.bottom}
						>
							<stop
								offset="22%"
								stopColor="var(--terrain-crest, currentColor)"
							/>
							<stop offset="57%" stopColor="var(--terrain-mid, currentColor)" />
							<stop
								offset="96%"
								stopColor="var(--terrain-base, currentColor)"
							/>
						</linearGradient>
					</defs>
					<g fill="currentColor" clipPath={`url(#${clipId})`}>
						<path
							className={lightInkClass}
							d={scene.dotPaths.light}
							fill={`url(#${gradientId})`}
						/>
						<g className="hidden dark:block">
							{scene.dotPaths.dark.map((path, level) => (
								<path key={path} d={path} fill={nightInks[level]} />
							))}
						</g>
					</g>
				</>
			) : (
				<polygon points={scene.silhouette} fill="currentColor" />
			)}

			{children}
		</svg>
	);
}

export function TerrainCanvas({
	config,
	selectedId,
	view,
	dither,
	drawingSeams,
	scene,
	color,
	onDraw,
}: {
	config: TerrainConfig;
	selectedId: string;
	view: ViewSettings;
	dither: boolean;
	drawingSeams: boolean;
	scene: TerrainScene;
	color: boolean;
	onDraw: (seam: DrawnSeam) => void;
}) {
	const selected = config.shapes.find((shape) => shape.id === selectedId);
	return (
		<TerrainArtwork scene={scene} color={color}>
			{view.showBase && (
				<polyline
					points={scene.basePoints}
					fill="none"
					stroke="#dc2626"
					strokeWidth={0.25}
					strokeDasharray="1 0.5"
				/>
			)}

			{view.showShapes &&
				config.shapes.map((shape) => (
					<polyline
						key={shape.id}
						points={samples
							.map(
								(x) =>
									`${x},${terrainFrame.bottom - evaluateShape(x, shape) * config.verticalScale}`,
							)
							.join(" ")}
						fill="none"
						stroke={shape.id === selectedId ? "#f59e0b" : "#999"}
						strokeWidth={0.3}
						strokeDasharray="1 0.5"
					/>
				))}

			{selected && view.showGuides && (
				<line
					x1={selected.center}
					x2={selected.center}
					y1={-120}
					y2={100}
					stroke="#f59e0b"
					strokeWidth={0.2}
					strokeDasharray="1 1"
				/>
			)}

			{view.showSeams &&
				scene.seams.map(({ id, name, seam }) => (
					<polyline
						key={id}
						aria-label={`${name} seam`}
						points={seamPoints(seam, scene.ridgeAt)}
						fill="none"
						stroke={dither ? "var(--foreground)" : "var(--background)"}
						strokeWidth={1.5}
						strokeDasharray="4 3"
						vectorEffect="non-scaling-stroke"
					/>
				))}
			{view.showSeams &&
				config.drawnSeams.map((seam, index) => (
					<polyline
						key={drawnSeamPoints(seam.points)}
						aria-label={`Drawn seam ${index + 1}`}
						points={drawnSeamPoints(seam.points)}
						fill="none"
						stroke={dither ? "var(--foreground)" : "var(--background)"}
						strokeWidth={1.5}
						strokeDasharray="4 3"
						vectorEffect="non-scaling-stroke"
					/>
				))}
			{drawingSeams && (
				<TerrainSeamDrawing ridgeAt={scene.ridgeAt} onDraw={onDraw} />
			)}
		</TerrainArtwork>
	);
}
