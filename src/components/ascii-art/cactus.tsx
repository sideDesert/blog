import { useEffect, useRef } from "react";

const W = 420;
const H = 460;
const stemBaseY = 453;

// ─────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────

const config = {
  geometry: {
    height: 375,
    stemWidth: 60,
    leftWidth: 44,
    rightWidth: 44,
    leftSpread: 125,
    rightSpread: 125,
    leftHeight: 155,
    rightHeight: 155,
    leftJoint: 108,
    rightJoint: 108,
    leftCurve: 100,
    rightCurve: 100,
    outline: 6,
  },
  left: {
    threshold: 0.35,
    period: 12,
    thickness: 4,
    spacing: 8,
    shadow: 1,
    phase: 0.3,
    reverse: false,
  },
  stem: {
    threshold: 0.2,
    period: 13,
    thickness: 4.5,
    spacing: 8,
    shadow: 1.2,
    phase: 0.15,
    reverse: false,
  },
  right: {
    threshold: 0.25,
    period: 12.5,
    thickness: 4,
    spacing: 8,
    shadow: 1,
    phase: 0.3,
    reverse: false,
  },
  print: {
    blur: 0.9,
    threshold: 0.23,
    resolution: 155,
    grain: 0.23,
    enabled: true,
  },
};

// ─────────────────────────────────────────
// Types and math
// ─────────────────────────────────────────

type Point = {
  x: number;
  y: number;
};

type Part = "left" | "right" | "stem";

type Branch = {
  name: Part;
  r: number;
  points: Point[];
};

type Sample = {
  i: number;
  d: number;
  u: number;
  v: number;
};

type Segment = {
  a: Point;
  dx: number;
  dy: number;
  l: number;
  u: number;
};

const p = (x: number, y: number): Point => ({ x, y });

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const mod = (x: number, n: number) => ((x % n) + n) % n;

// ─────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────

function line(a: Point, b: Point): Point[] {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3));

  return Array.from({ length: n + 1 }, (_, i) =>
    p(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n),
  );
}

function bezier(a: Point, b: Point, c: Point, d: Point): Point[] {
  return Array.from({ length: 81 }, (_, i) => {
    const t = i / 80;
    const s = 1 - t;

    return p(
      s * s * s * a.x +
        3 * s * s * t * b.x +
        3 * s * t * t * c.x +
        t * t * t * d.x,

      s * s * s * a.y +
        3 * s * s * t * b.y +
        3 * s * t * t * c.y +
        t * t * t * d.y,
    );
  });
}

function arm(side: "left" | "right"): Branch {
  const g = config.geometry;

  const x = 210;
  const j = 423 - g[`${side}Joint`];

  const ax = x + (side === "left" ? -1 : 1) * g[`${side}Spread`];

  const h = g[`${side}Height`];
  const bend = Math.min(h - 8, g[`${side}Curve`]);

  const end = p(ax, j - bend);

  return {
    name: side,
    r: g[`${side}Width`] / 2,

    points: [
      ...bezier(p(x, j), p(ax, j), p(ax, j - bend * 0.45), end),
      ...line(end, p(ax, j - h)).slice(1),
    ],
  };
}

function segments(points: Point[]): Segment[] {
  let u = 0;

  return points.slice(1).flatMap((z, i) => {
    const a = points[i];

    const dx = z.x - a.x;
    const dy = z.y - a.y;
    const l = Math.hypot(dx, dy);

    if (l <= 0.0001) return [];

    const segment = { a, dx, dy, l, u };

    u += l;

    return [segment];
  });
}

// Find the nearest point on the branch.
// u: distance along the branch.
// v: signed perpendicular distance.
// d: distance from the nearest point.

function closest(x: number, y: number, ss: Segment[]) {
  let best = Infinity;
  let u = 0;
  let v = 0;

  for (const s of ss) {
    const px = x - s.a.x;
    const py = y - s.a.y;

    const along = (px * s.dx + py * s.dy) / s.l;

    const t = clamp(along / s.l, 0, 1);

    const ex = px - t * s.dx;
    const ey = py - t * s.dy;

    const d = ex * ex + ey * ey;

    if (d < best) {
      best = d;

      u = s.u + along;
      v = (-px * s.dy + py * s.dx) / s.l;
    }
  }

  return {
    d: Math.sqrt(best),
    u,
    v,
  };
}

// ─────────────────────────────────────────
// Rasterization and seamless outline
// ─────────────────────────────────────────

function buildGeometry() {
  const g = config.geometry;

  const branches: Branch[] = [
    arm("left"),
    arm("right"),
    {
      name: "stem",
      r: g.stemWidth / 2,
      points: [p(210, stemBaseY), p(210, 423 - g.height)],
    },
  ];

  const mask = new Uint8Array(W * H);
  const owner = new Int8Array(W * H).fill(-1);

  const fields = branches.map((b, index) => {
    const ss = segments(b.points);
    const values: Sample[] = [];

    const minX = Math.max(
      0,
      Math.floor(Math.min(...b.points.map((q) => q.x)) - b.r),
    );

    const maxX = Math.min(
      W - 1,
      Math.ceil(Math.max(...b.points.map((q) => q.x)) + b.r),
    );

    const minY = Math.max(
      0,
      Math.floor(Math.min(...b.points.map((q) => q.y)) - b.r),
    );

    const maxY = Math.min(
      stemBaseY - 1,
      Math.ceil(Math.max(...b.points.map((q) => q.y)) + b.r),
    );

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const q = closest(x + 0.5, y + 0.5, ss);

        if (q.d > b.r) continue;

        const i = y * W + x;

        mask[i] = 1;
        owner[i] = index;

        values.push({ ...q, i });
      }
    }

    return { b, values };
  });

  // Calculate the outline from the combined mask.
  // This prevents seams between the arms and stem.

  const edges = new Uint8Array(W * H);

  const t = g.outline;
  const reach = Math.ceil(t);

  if (t > 0) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;

        if (!mask[i]) continue;

        outer: for (let dy = -reach; dy <= reach; dy++) {
          for (let dx = -reach; dx <= reach; dx++) {
            if (dx * dx + dy * dy > t * t) {
              continue;
            }

            const nx = x + dx;
            const ny = y + dy;

            if (nx < 0 || nx >= W || ny < 0 || ny >= H || !mask[ny * W + nx]) {
              edges[i] = 1;
              break outer;
            }
          }
        }
      }
    }
  }

  return { fields, owner, edges };
}

// ─────────────────────────────────────────
// Curvature-aware dithering
// ─────────────────────────────────────────

function drawDither(ctx: CanvasRenderingContext2D) {
  const { fields, owner, edges } = buildGeometry();

  const image = ctx.createImageData(W, H);
  const data = image.data;

  fields.forEach(({ b, values }, index) => {
    const c = config[b.name];

    for (const q of values) {
      if (owner[q.i] !== index) continue;

      const edge = edges[q.i];

      const v = q.v * (c.reverse ? -1 : 1);

      // Shading across the branch.

      const side = clamp(0.5 - v / (2 * b.r), 0, 1);

      const darkness = clamp(0.12 + side * 0.95 * c.shadow, 0, 0.96);

      // Rib index across the branch.

      const rib = Math.floor((q.v + b.r) / c.spacing);

      // Offset alternating ribs.

      const phase = mod(q.u + mod(rib, 2) * c.period * c.phase, c.period);

      // Darkness controls the mark length.
      // Threshold independently controls visibility.

      const ink =
        edge ||
        (darkness > c.threshold &&
          phase < c.period * darkness &&
          mod(q.v + b.r, c.spacing) < c.thickness);

      if (!ink) continue;

      const i = q.i * 4;

      data[i] = 32;
      data[i + 1] = 32;
      data[i + 2] = 32;
      data[i + 3] = 255;
    }
  });

  ctx.putImageData(image, 0, 0);
  return edges;
}

// ─────────────────────────────────────────
// Ink post-processing
// ─────────────────────────────────────────

function processInk(
  source: HTMLCanvasElement,
  out: CanvasRenderingContext2D,
  inkColor: Ink,
  outline: Uint8Array,
) {
  const c = config.print;

  out.clearRect(0, 0, W, H);

  if (!c.enabled) {
    out.drawImage(source, 0, 0);
    return;
  }

  // Reduce the print resolution.

  const small = document.createElement("canvas");

  small.height = c.resolution;
  small.width = Math.round((c.resolution * W) / H);

  const s = small.getContext("2d");

  if (!s) {
    throw new Error("Canvas 2D unavailable");
  }

  s.fillStyle = "#fff";
  s.fillRect(0, 0, small.width, small.height);

  s.drawImage(source, 0, 0, small.width, small.height);

  // Upscale and simulate ink bleeding.

  out.fillStyle = "#fff";
  out.fillRect(0, 0, W, H);

  out.imageSmoothingEnabled = true;
  out.filter = `blur(${c.blur}px)`;

  out.drawImage(small, 0, 0, W, H);

  out.filter = "none";

  // Apply grain and convert back to binary ink.

  const image = out.getImageData(0, 0, W, H);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % W;
    const y = Math.floor(i / 4 / W);

    // Deterministic noise.

    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

    const noise = (n - Math.floor(n) - 0.5) * c.grain;

    const darkness = 1 - data[i] / 255;

    const ink =
      y < stemBaseY && (outline[i / 4] || darkness + noise > c.threshold);

    data[i] = inkColor[0];
    data[i + 1] = inkColor[1];
    data[i + 2] = inkColor[2];

    // Transparent background.

    data[i + 3] = ink ? 255 : 0;
  }

  out.putImageData(image, 0, 0);
}

// ─────────────────────────────────────────
// Renderer and bitmap cache
// ─────────────────────────────────────────

type Ink = readonly [number, number, number];

const NEUTRAL_INKS = {
  light: [32, 32, 32] as Ink,
  dark: [168, 166, 161] as Ink,
};

const DARK_GREEN_INKS = {
  light: [54, 91, 73] as Ink,
  dark: [54, 91, 73] as Ink,
};

const bitmaps = new Map<string, HTMLCanvasElement>();

function renderCactus(canvas: HTMLCanvasElement, inkColor: Ink) {
  const out = canvas.getContext("2d");

  if (!out) return;

  const key = inkColor.join(",");

  let bitmap = bitmaps.get(key);

  if (!bitmap) {
    const source = document.createElement("canvas");

    source.width = W;
    source.height = H;

    const ctx = source.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D unavailable");
    }

    const outline = drawDither(ctx);

    const result = document.createElement("canvas");

    result.width = W;
    result.height = H;

    const target = result.getContext("2d");

    if (!target) {
      throw new Error("Canvas 2D unavailable");
    }

    processInk(source, target, inkColor, outline);

    bitmap = result;
    bitmaps.set(key, bitmap);
  }

  out.clearRect(0, 0, W, H);
  out.drawImage(bitmap, 0, 0);
}

// ─────────────────────────────────────────
// Public React component
// ─────────────────────────────────────────

type CactusProps = {
  width?: number | string;
  className?: string;
  darkGreen?: boolean;
  far?: boolean;
};

function CactusLayer({
  inkColor,
  mode,
  width,
  className,
  filterClassName,
}: {
  inkColor: Ink;
  mode: "light" | "dark";
  width: number | string;
  className?: string;
  filterClassName?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      renderCactus(ref.current, inkColor);
    }
  }, [inkColor]);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className={`block ${mode === "light" ? "dark:hidden" : "hidden dark:block"} ${filterClassName ?? ""} ${className ?? ""}`}
      style={{
        width,
        height: "auto",
      }}
      role="img"
      aria-label="Dithered cactus"
    />
  );
}

export default function Cactus({
  width = 200,
  className,
  darkGreen = true,
  far = false,
}: CactusProps) {
  const inks = darkGreen ? DARK_GREEN_INKS : NEUTRAL_INKS;
  const lightFilter = far
    ? darkGreen
      ? "[filter:brightness(1.15)_saturate(0.8)]"
      : "brightness-[2.8] dark:brightness-100"
    : undefined;

  return (
    <>
      <CactusLayer
        inkColor={inks.light}
        mode="light"
        width={width}
        className={className}
        filterClassName={lightFilter}
      />
      <CactusLayer
        inkColor={inks.dark}
        mode="dark"
        width={width}
        className={className}
      />
    </>
  );
}
