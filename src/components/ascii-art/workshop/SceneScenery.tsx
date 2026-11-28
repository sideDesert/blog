import type { ComponentProps } from "react";
import Cactus from "../cactus";
import DesertTexture, { type CloudPlacement } from "../DesertTexture";
import Grass from "../Grass";
import type { Layer } from "./sceneLayer";

export type Plant = Layer & {
	id: `plant-${string}`;
	x: number;
	y: number;
	width: number;
} & (
		| {
				species: "cactus";
				far?: boolean;
				silhouette?: ComponentProps<typeof Cactus>["silhouette"];
		  }
		| { species: "grass"; variant: ComponentProps<typeof Grass>["variant"] }
	);

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
					className={`absolute -translate-x-1/2 -translate-y-full ${plant.species === "grass" ? "opacity-80" : ""}`}
					style={{
						left: `${plant.x}%`,
						top: `${plant.y}%`,
						width: `${plant.width}%`,
					}}
				>
					{plant.species === "cactus" ? (
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
