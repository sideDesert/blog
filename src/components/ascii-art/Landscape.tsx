import { type Dispatch, useEffect, useState } from "react";
import DesertTexture from "./DesertTexture";
import Ground from "./Ground";
import { NightStars } from "./NightStars";
import Sun, { type SunCircles } from "./Sun";
import {
  DEFAULT_SUN_TRAIL_COLORS,
  type SunPalettes,
  selectSunPalette,
  selectSunTrailColor,
} from "./sun/palette";
import Terrain from "./Terrain";
import { useDesertTheme } from "./useDesertTheme";
import type { TerrainAction, TerrainState } from "./terrain/state";

const SUN_TILT_DEGREES = 6;
const COLOR_STORAGE_KEY = "color";

function readColorEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(COLOR_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export default function Landscape({
  terrainState,
  terrainDispatch,
  sunPalettes,
  sunCircles,
  showSunBounds,
  onCactusClick,
}: {
  terrainState: TerrainState;
  terrainDispatch: Dispatch<TerrainAction>;
  sunPalettes: SunPalettes;
  sunCircles: SunCircles;
  showSunBounds: boolean;
  onCactusClick: () => void;
}) {
  const resolvedTheme = useDesertTheme();
  const [colorEnabled, setColorEnabled] = useState(false);

  useEffect(() => setColorEnabled(readColorEnabled()), []);

  function toggleColor() {
    const enabled = !colorEnabled;
    setColorEnabled(enabled);

    try {
      window.localStorage.setItem(COLOR_STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      return;
    }
  }

  const isMoon = resolvedTheme === "dark";
  const sunPalette = selectSunPalette(sunPalettes, resolvedTheme, colorEnabled);
  const trailColor = selectSunTrailColor(
    DEFAULT_SUN_TRAIL_COLORS,
    resolvedTheme,
    colorEnabled,
  );

  return (
    <div
      className="@container relative aspect-[2/1] w-full overflow-hidden bg-background min-[56rem]:h-full min-[56rem]:aspect-auto [--ground-depth:calc(19%+1.33cqw)]"
      data-color={colorEnabled}
    >
      <div
        role="img"
        aria-label="A stippled desert panorama with mesas and saguaros"
      >
        <DesertTexture
          layer="sky"
          className={
            colorEnabled
              ? "filter-[sepia(0.75)_saturate(1.9)_hue-rotate(-8deg)]"
              : "brightness-0 dark:brightness-100"
          }
        />
        <NightStars />
        <div className="absolute inset-x-0 bottom-[calc(var(--ground-depth)-6.75cqw)] h-[calc(55%+11.78cqw)]">
          <Terrain
            state={terrainState}
            dispatch={terrainDispatch}
            color={colorEnabled}
          />
        </div>
        <Ground color={colorEnabled} onCactusClick={onCactusClick} />
      </div>

      <button
        type="button"
        className="absolute top-[22%] left-[61.2%] w-[16%] translate-x-[-47%] translate-y-[-48%] cursor-pointer border-0 bg-none p-0 focus-visible:rounded-full focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        onClick={toggleColor}
        aria-label="Desert colors"
        aria-pressed={colorEnabled}
        title={colorEnabled ? "Turn colors off" : "Turn colors on"}
      >
        <span
          className="block w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{
            transform: `rotate(${colorEnabled ? -SUN_TILT_DEGREES : SUN_TILT_DEGREES}deg)`,
          }}
        >
          <Sun
            className="block w-full"
            label={isMoon ? "Moon" : "Sun"}
            palette={sunPalette}
            trailColor={trailColor}
            circles={sunCircles}
            showBounds={showSunBounds}
          />
        </span>
      </button>
    </div>
  );
}
