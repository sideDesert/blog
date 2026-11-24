import { useEffect, useRef, useState } from "react";

export type Circle = {
  x: number;
  y: number;
  r: number;
};

export type SunCircles = {
  A: Circle;
  B: Circle;
  C: Circle;
};

export type SunProps = {
  debug?: boolean;
  initialCircles?: SunCircles;
};

const DEFAULT_CIRCLES: SunCircles = {
  A: { x: 42, y: 54, r: 30 },
  B: { x: 50, y: 39, r: 34 },
  C: { x: 47, y: 48, r: 31 },
};

function insideCircle(x: number, y: number, c: Circle) {
  return (x - c.x) ** 2 + (y - c.y) ** 2 <= c.r ** 2;
}

function CircleControls({
  name,
  circle,
  onChange,
}: {
  name: string;
  circle: Circle;
  onChange: (circle: Circle) => void;
}) {
  return (
    <div className="space-y-2">
      <h3>{name}</h3>

      {(["x", "y", "r"] as const).map((key) => (
        <label key={key} className="flex items-center gap-3">
          <span className="w-6">{key}</span>

          <input
            type="range"
            min={key === "r" ? 5 : 0}
            max={key === "r" ? 50 : 100}
            value={circle[key]}
            onChange={(e) =>
              onChange({
                ...circle,
                [key]: Number(e.target.value),
              })
            }
          />

          <span>{circle[key]}</span>
        </label>
      ))}
    </div>
  );
}

export default function Sun({
  debug = false,
  initialCircles = DEFAULT_CIRCLES,
}: SunProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [circles, setCircles] = useState<SunCircles>(initialCircles);
  const [showBounds, setShowBounds] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const dots = [];

  for (let x = 0; x < 100; x += 3) {
    for (let y = 0; y < 100; y += 3) {
      const isInsideA = insideCircle(x, y, circles.A);
      const isInsideB = insideCircle(x, y, circles.B);
      const isInsideC = insideCircle(x, y, circles.C);

      if (isInsideC) {
        dots.push(
          <rect
            key={`${x}-${y}`}
            x={x - 1}
            y={y - 1}
            width={2}
            height={2}
            fill="hsl(35, 100%, 50%)"
            data-animate={isInsideA !== isInsideB}
          />,
        );
      }
    }
  }

  useEffect(() => {
    const allDots = ref.current!.querySelectorAll("rect");

    allDots.forEach((dot) => {
      dot.setAttribute("fill", "hsl(35, 100%, 50%)");
    });

    const animatedDots = ref.current!.querySelectorAll('[data-animate="true"]');

    const heat = Array.from(animatedDots, () => Math.random());

    let animationId: number;
    let lastUpdate = 0;

    const step = 50;
    const heatVariation = 0.4;
    const baseHue = 35;
    const hueRange = 15;

    function animate(time: number) {
      if (time - lastUpdate >= step) {
        animatedDots.forEach((dot, i) => {
          heat[i] += (Math.random() - 0.5) * heatVariation;
          heat[i] = Math.max(0, Math.min(1, heat[i]));

          const hue = baseHue - heat[i] * hueRange;

          dot.setAttribute("fill", `hsl(${hue}, 100%, 50%)`);
        });

        lastUpdate = time;
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [circles]);

  function updateCircle(name: keyof SunCircles, circle: Circle) {
    setCircles((current) => ({ ...current, [name]: circle }));
    setCopyState("idle");
  }

  async function copyCircles() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(circles, null, 2));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="flex gap-8">
      <svg ref={ref} viewBox="0 0 100 100" className="w-96">
        {dots}

        {showBounds &&
          [
            { ...circles.A, color: "#60a5fa" },
            { ...circles.B, color: "#c084fc" },
            { ...circles.C, color: "#4ade80" },
          ].map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={c.r}
              fill="none"
              stroke={c.color}
              strokeWidth={0.3}
            />
          ))}
      </svg>

      {debug && (
        <aside className="space-y-6">
          <CircleControls
            name="Circle A"
            circle={circles.A}
            onChange={(circle) => updateCircle("A", circle)}
          />

          <CircleControls
            name="Circle B"
            circle={circles.B}
            onChange={(circle) => updateCircle("B", circle)}
          />

          <CircleControls
            name="Circle C (Mask)"
            circle={circles.C}
            onChange={(circle) => updateCircle("C", circle)}
          />

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(e) => setShowBounds(e.target.checked)}
            />
            Show boundaries
          </label>

          <div className="space-y-2">
            <button type="button" onClick={copyCircles} aria-live="polite">
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy config"}
            </button>

            <p className="m-0 text-sm text-muted-foreground">
              Copies {"{ A, B, C }"} as JSON.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
