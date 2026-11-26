import type { ComponentProps } from "react";
import Cactus from "../cactus";
import DesertTexture, { type CloudPlacement } from "../DesertTexture";
import Grass from "../Grass";
import { type NightStar, NightStars } from "../NightStars";
import Sun, { DEFAULT_CIRCLES } from "../Sun";
import {
	DEFAULT_SUN_PALETTES,
	DEFAULT_SUN_TRAIL_COLORS,
	selectSunPalette,
	selectSunTrailColor,
} from "../sun/palette";
import { useDesertTheme } from "../useDesertTheme";
import Wind from "../Wind";

export type Plant = {
	x: number;
	y: number;
	width: number;
} & (
	| { kind: "cactus"; far?: boolean }
	| { kind: "grass"; variant: ComponentProps<typeof Grass>["variant"] }
);

export function SceneSky({
	celestial,
	stars,
}: {
	celestial: { x: number; y: number; width: number };
	stars?: readonly NightStar[];
}) {
	const theme = useDesertTheme();
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<NightStars stars={stars} verticalScale={stars ? 1 : 0.62} />
			<div
				className="absolute opacity-85 -translate-x-1/2 -translate-y-1/2"
				style={{
					left: `${celestial.x}%`,
					top: `${celestial.y}%`,
					width: `${celestial.width}%`,
				}}
			>
				<Sun
					circles={DEFAULT_CIRCLES}
					label={theme === "dark" ? "Moon" : "Sun"}
					palette={selectSunPalette(DEFAULT_SUN_PALETTES, theme, false)}
					trailColor={selectSunTrailColor(
						DEFAULT_SUN_TRAIL_COLORS,
						theme,
						false,
					)}
					className="block w-full"
				/>
			</div>
		</div>
	);
}

export function SceneClouds({
	clouds,
}: {
	clouds?: readonly CloudPlacement[];
}) {
	return (
		<div
			className={`pointer-events-none absolute inset-x-0 top-0 opacity-60 ${clouds ? "h-full" : "h-[58%]"}`}
			aria-hidden="true"
		>
			<DesertTexture
				layer="sky"
				clouds={clouds}
				className="brightness-0 dark:brightness-100"
			/>
		</div>
	);
}

export function ScenePlants({ plants }: { plants: readonly Plant[] }) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			{plants.map((plant) => (
				<div
					key={plant.x}
					className={`absolute -translate-x-1/2 -translate-y-full ${plant.kind === "grass" ? "opacity-80 saturate-0" : ""}`}
					style={{
						left: `${plant.x}%`,
						top: `${plant.y}%`,
						width: `${plant.width}%`,
					}}
				>
					{plant.kind === "cactus" ? (
						<Cactus
							width="100%"
							darkGreen={false}
							far={plant.far}
							className="scale-x-[0.88] opacity-75"
						/>
					) : (
						<Grass variant={plant.variant} color={false} />
					)}
				</div>
			))}
		</div>
	);
}

export function SceneWind() {
	return (
		<div
			className="pointer-events-none absolute inset-x-0 top-[45%] bottom-[14%] opacity-60"
			aria-hidden="true"
		>
			<Wind color={false} distant={false} />
		</div>
	);
}
