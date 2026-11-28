import { useDesertAudioContext } from "#/components/audio/DesertAudioContext";
import type { ResolvedTheme } from "#/lib/appearance";
import { useEffect, useState } from "react";
import { readStudioSave } from "#/lib/studioStorage";
import Sun, { DEFAULT_CIRCLES, type SunCircles } from "./Sun";
import {
	DEFAULT_SUN_PALETTES,
	DEFAULT_SUN_TRAIL_COLORS,
	selectSunPalette,
	selectSunTrailColor,
	type SunPalettes,
} from "./sun/palette";

export function DesertCelestial({
	theme,
	motion,
	color,
	onToggleColor,
	circles,
	palettes,
	showBounds,
}: {
	theme: ResolvedTheme;
	motion: boolean;
	color: boolean;
	onToggleColor: () => void;
	circles?: SunCircles;
	palettes?: SunPalettes;
	showBounds?: boolean;
}) {
	const { playMoonChime } = useDesertAudioContext();
	const [saved, setSaved] = useState({
		circles: DEFAULT_CIRCLES,
		palettes: DEFAULT_SUN_PALETTES,
	});
	useEffect(() => {
		if (!circles || !palettes) {
			const save = readStudioSave();
			setSaved({
				circles: save.circles ?? DEFAULT_CIRCLES,
				palettes: save.palettes ?? DEFAULT_SUN_PALETTES,
			});
		}
	}, [circles, palettes]);

	return (
		<button
			type="button"
			className="absolute top-[22%] left-[61.2%] z-10 w-18 translate-x-[-47%] translate-y-[-48%] cursor-pointer rounded-full border-0 bg-none p-0 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-foreground"
			aria-label="Desert colors"
			aria-pressed={color}
			title={color ? "Turn colors off" : "Turn colors on"}
			onClick={onToggleColor}
		>
			<span
				className="block w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
				style={{ transform: `rotate(${color ? -6 : 6}deg)` }}
			>
				<Sun
					className="block w-full"
					motion={motion}
					onBrush={theme === "dark" ? playMoonChime : undefined}
					circles={circles ?? saved.circles}
					showBounds={showBounds}
					label={theme === "dark" ? "Moon" : "Sun"}
					palette={selectSunPalette(palettes ?? saved.palettes, theme, color)}
					trailColor={selectSunTrailColor(
						DEFAULT_SUN_TRAIL_COLORS,
						theme,
						color,
					)}
				/>
			</span>
		</button>
	);
}
