import { useAppearance } from "#/lib/appearance";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { readStudioSave } from "#/lib/studioStorage";
import { DesertCelestial } from "./DesertCelestial";
import DesertTexture from "./DesertTexture";
import Ground from "./Ground";
import { NightStars } from "./NightStars";
import type { SunCircles } from "./Sun";
import type { SunPalettes } from "./sun/palette";
import { TerrainArtwork } from "./terrain/Canvas";
import { createScene } from "./terrain/geometry";
import {
	createInitialConfig,
	defaultTerrainRenderSettings,
} from "./terrain/model";
import { useDesertMotion } from "./useDesertMotion";

function PublishedTerrain({ color }: { color: boolean }) {
	const [config, setConfig] = useState(createInitialConfig);

	useEffect(() => {
		const { terrain: saved } = readStudioSave();
		if (saved) setConfig(saved);
	}, []);

	const scene = useMemo(
		() => createScene(config, defaultTerrainRenderSettings),
		[config],
	);

	return <TerrainArtwork scene={scene} color={color} decorative />;
}

export default function Landscape({
	renderTerrain,
	sun,
	studioShortcut = false,
}: {
	renderTerrain?: (color: boolean) => ReactNode;
	sun?: { palettes: SunPalettes; circles: SunCircles; showBounds: boolean };
	studioShortcut?: boolean;
}) {
	const motion = useDesertMotion();
	const { theme, colorEnabled, toggleColor } = useAppearance();

	return (
		<div
			className="@container relative aspect-[2/1] w-full overflow-hidden bg-background min-[56rem]:h-full min-[56rem]:aspect-auto [--ground-depth:calc(19%+1.33cqw)]"
			data-color={colorEnabled}
			data-desert-motion={motion}
		>
			<div
				role="img"
				aria-label="A stippled desert panorama with mesas and saguaros"
			>
				<DesertTexture layer="sky" color={colorEnabled} />
				<NightStars />
				<div className="absolute inset-x-0 bottom-[calc(var(--ground-depth)-6.75cqw)] h-[calc(55%+11.78cqw)]">
					{renderTerrain ? (
						renderTerrain(colorEnabled)
					) : (
						<PublishedTerrain color={colorEnabled} />
					)}
				</div>
			</div>
			<Ground color={colorEnabled} studioShortcut={studioShortcut} />

			<DesertCelestial
				theme={theme}
				motion={motion}
				color={colorEnabled}
				onToggleColor={toggleColor}
				{...sun}
			/>
		</div>
	);
}
