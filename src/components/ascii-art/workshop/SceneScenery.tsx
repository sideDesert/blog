import type { ComponentProps } from "react";
import Cactus from "../cactus";
import DesertTexture, { type CloudPlacement } from "../DesertTexture";
import Grass from "../Grass";
import Sun, { DEFAULT_CIRCLES } from "../Sun";
import {
	DEFAULT_SUN_PALETTES,
	DEFAULT_SUN_TRAIL_COLORS,
	selectSunPalette,
	selectSunTrailColor,
	type SunTheme,
} from "../sun/palette";

export type Plant = {
	id: `plant-${string}`;
	label: string;
	x: number;
	y: number;
	width: number;
} & (
	| {
			kind: "cactus";
			far?: boolean;
			silhouette?: ComponentProps<typeof Cactus>["silhouette"];
	  }
	| { kind: "grass"; variant: ComponentProps<typeof Grass>["variant"] }
);

export function SceneCelestial({
	celestial,
	theme,
	color,
	onToggleColor,
}: {
	celestial: { x: number; y: number; width: number };
	theme: SunTheme;
	color: boolean;
	onToggleColor: () => void;
}) {
	return (
		<div className="pointer-events-none absolute inset-0">
			<button
				type="button"
				className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-none p-0 opacity-85 focus-visible:outline-1 focus-visible:outline-offset-2"
				aria-label="Desert colors"
				aria-pressed={color}
				title={color ? "Turn colors off" : "Turn colors on"}
				onClick={onToggleColor}
				style={{
					left: `${celestial.x}%`,
					top: `${celestial.y}%`,
					width: `${celestial.width}%`,
				}}
			>
				<Sun
					circles={DEFAULT_CIRCLES}
					label={theme === "dark" ? "Moon" : "Sun"}
					palette={selectSunPalette(DEFAULT_SUN_PALETTES, theme, color)}
					trailColor={selectSunTrailColor(
						DEFAULT_SUN_TRAIL_COLORS,
						theme,
						color,
					)}
					className="block w-full"
				/>
			</button>
		</div>
	);
}

export function SceneClouds({
	clouds,
	color,
}: {
	clouds?: readonly CloudPlacement[];
	color: boolean;
}) {
	return (
		<div
			className={`pointer-events-none absolute inset-x-0 top-0 opacity-60 ${clouds ? "h-full" : "h-[58%]"}`}
			aria-hidden="true"
		>
			<DesertTexture layer="sky" clouds={clouds} color={color} />
		</div>
	);
}

export function ScenePlants({
	plants,
	color,
}: {
	plants: readonly Plant[];
	color: boolean;
}) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			{plants.map((plant) => (
				<div
					key={plant.id}
					data-scene-plant={plant.id}
					className={`absolute -translate-x-1/2 -translate-y-full ${plant.kind === "grass" ? "opacity-80" : ""}`}
					style={{
						left: `${plant.x}%`,
						top: `${plant.y}%`,
						width: `${plant.width}%`,
					}}
				>
					{plant.kind === "cactus" ? (
						<Cactus
							width="100%"
							darkGreen={color}
							far={plant.far}
							silhouette={plant.silhouette}
							className={`scale-x-[0.88] ${plant.silhouette === "workshop" ? "opacity-[0.68]" : "opacity-75"}`}
						/>
					) : (
						<Grass
							variant={plant.variant}
							color={color}
							windDelay={plant.x * -0.11}
						/>
					)}
				</div>
			))}
		</div>
	);
}
