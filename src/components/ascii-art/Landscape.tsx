import { type CSSProperties, type Dispatch, useEffect, useState } from "react";
import DesertTexture from "./DesertTexture";
import Ground from "./Ground";
import Sun, { type SunCircles } from "./Sun";
import {
  DEFAULT_SUN_TRAIL_COLORS,
  type SunPalettes,
  type SunTheme,
  selectSunPalette,
  selectSunTrailColor,
} from "./sun/palette";
import Terrain from "./Terrain";
import type { TerrainAction, TerrainState } from "./terrain/state";

const SUN_TILT_DEGREES = 6;
const COLOR_STORAGE_KEY = "color";

function readColorEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(COLOR_STORAGE_KEY) !== "off";
}

const brightStars = [
  { x: 4.8, y: 12, size: 0.24, opacity: 0.63 },
  { x: 7.2, y: 34, size: 0.36, opacity: 0.72 },
  { x: 12.1, y: 25, size: 0.28, opacity: 0.72 },
  { x: 15.5, y: 10, size: 0.47, opacity: 0.95 },
  { x: 19.8, y: 18, size: 0.26, opacity: 0.62 },
  { x: 23, y: 8, size: 0.33, opacity: 0.79 },
  { x: 26.4, y: 22, size: 0.32, opacity: 0.67 },
  { x: 30, y: 36, size: 0.27, opacity: 0.72 },
  { x: 34.1, y: 13, size: 0.38, opacity: 0.83 },
  { x: 38.3, y: 21, size: 0.24, opacity: 0.66 },
  { x: 44.6, y: 29, size: 0.52, opacity: 0.94 },
  { x: 47.6, y: 8, size: 0.28, opacity: 0.77 },
  { x: 50.7, y: 36, size: 0.24, opacity: 0.61 },
  { x: 52.8, y: 9, size: 0.3, opacity: 0.73 },
  { x: 68.4, y: 13, size: 0.28, opacity: 0.73 },
  { x: 70.8, y: 45, size: 0.34, opacity: 0.76 },
  { x: 75.5, y: 27, size: 0.28, opacity: 0.77 },
  { x: 80.6, y: 12, size: 0.41, opacity: 0.86 },
  { x: 87.1, y: 17, size: 0.29, opacity: 0.64 },
  { x: 93.1, y: 27, size: 0.37, opacity: 0.79 },
  { x: 97.1, y: 6, size: 0.27, opacity: 0.72 },
];

function createStarField() {
  const stars = [...brightStars];
  let seed = 37;

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  }

  for (let attempt = 0; attempt < 600 && stars.length < 72; attempt++) {
    const x = 3 + random() * 94;
    const skyBottom = x >= 9 && x <= 26 ? 19 : x < 33 || x > 82 ? 37 : 57;
    const y = 4 + random() * (skyBottom - 4);
    const moonDistance = ((x - 61.2) / 5.6) ** 2 + ((y - 22) / 25) ** 2;
    if (moonDistance < 1) continue;

    const overlapsStar = stars.some(
      (star) => Math.hypot(star.x - x, (star.y - y) / 3) < 1.4,
    );
    if (overlapsStar) continue;

    stars.push({
      x,
      y,
      size: 0.23 + random() * 0.16,
      opacity: 0.66 + random() * 0.26,
    });
  }

  return stars;
}

const stars = createStarField();

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
  const [resolvedTheme, setResolvedTheme] = useState<SunTheme>("light");
  const [colorEnabled, setColorEnabled] = useState(true);

  useEffect(() => {
    setColorEnabled(readColorEnabled());

    const root = document.documentElement;
    const syncTheme = () => {
      const theme: SunTheme = root.classList.contains("dark")
        ? "dark"
        : "light";

      setResolvedTheme(theme);
    };
    const observer = new MutationObserver(syncTheme);

    syncTheme();
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  function toggleColor() {
    const enabled = !colorEnabled;
    setColorEnabled(enabled);
    window.localStorage.setItem(COLOR_STORAGE_KEY, enabled ? "on" : "off");
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
      className="@container relative w-full overflow-hidden bg-background [--ground-depth:calc(19%+1.33cqw)]"
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden dark:block"
        >
          {stars.map(({ x, y, size, opacity }, index) => (
            <span
              key={x}
              className="night-star absolute aspect-square -translate-x-1/2 -translate-y-1/2 bg-foreground [clip-path:polygon(50%_0,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0_50%,38%_38%)]"
              style={
                {
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `clamp(1.7px, ${size}cqw, 6.5px)`,
                  "--star-opacity": opacity,
                  animationDelay: `${-index * 0.7}s`,
                  animationDuration: `${4.5 + (index % 6) * 0.45}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
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
