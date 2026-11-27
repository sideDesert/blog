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

type CanvasProps = {
	clipId: string;
	config: TerrainConfig;
	selectedId: string;
	view: ViewSettings;
	dither: boolean;
	drawingSeams: boolean;
	scene: TerrainScene;
	color: boolean;
	canvasClassName: string;
	onDraw: (seam: DrawnSeam) => void;
};

export function TerrainCanvas({
	clipId,
	config,
	selectedId,
	view,
	dither,
	drawingSeams,
	scene,
	color,
	canvasClassName,
	onDraw,
}: CanvasProps) {
	const selected = config.shapes.find((shape) => shape.id === selectedId);
	const gradientId = `${clipId}-ink`;
	const lightInkClass = `dark:hidden ${color ? "fill-(--desert-sand-light)" : ""}`;
	const darkInkClass = color
		? "hidden dark:block [--terrain-ink-0:var(--desert-sand-shadow)] [--terrain-ink-1:var(--desert-sand-deep)] [--terrain-ink-2:var(--desert-sand-muted)] [--terrain-ink-3:var(--desert-sand)] [--terrain-ink-4:var(--desert-sand-rim)] [--terrain-ink-5:var(--desert-sand-highlight)]"
		: "hidden dark:block [--terrain-ink-0:var(--accent)] [--terrain-ink-1:var(--border)] [--terrain-ink-2:#767775] [--terrain-ink-3:#949493] [--terrain-ink-4:var(--muted-foreground)] [--terrain-ink-5:var(--foreground)]";

	return (
		<svg
			role="img"
			aria-label="Terrain artwork"
			className={canvasClassName}
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
						<g className={darkInkClass}>
							{scene.dotPaths.dark.map((path, level) => (
								<path
									key={path}
									d={path}
									fill={`var(--terrain-ink-${level})`}
								/>
							))}
						</g>
					</g>
				</>
			) : (
				<polygon points={scene.silhouette} fill="currentColor" />
			)}

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
		</svg>
	);
}
