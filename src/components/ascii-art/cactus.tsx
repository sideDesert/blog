import { useEffect, useRef } from "react";
import { sampleGlyphCell } from "./ditherGlyphs";

const W = 420;
const H = 460;
const stemBaseY = 453;

const homeSilhouette = {
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
};

const silhouettes = {
  home: homeSilhouette,
  workshop: {
    ...homeSilhouette,
    stemWidth: 62,
    leftWidth: 46,
    rightWidth: 46,
    leftSpread: 99,
    rightSpread: 102,
    leftHeight: 145,
    rightHeight: 135,
    leftJoint: 138,
    rightJoint: 135,
  },
};

type Silhouette = keyof typeof silhouettes;

// ─────────────────────────────────────────
// Types and math
// ─────────────────────────────────────────

type Point = {
  x: number;
  y: number;
};

type Branch = {
  r: number;
  points: Point[];
};

type Sample = {
  i: number;
  v: number;
};

type Segment = {
  a: Point;
  dx: number;
  dy: number;
  l: number;
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

function arm(side: "left" | "right", g: typeof homeSilhouette): Branch {
  const x = 210;
  const j = 423 - g[`${side}Joint`];

  const ax = x + (side === "left" ? -1 : 1) * g[`${side}Spread`];

  const h = g[`${side}Height`];
  const bend = Math.min(h - 8, g[`${side}Curve`]);

  const end = p(ax, j - bend);

  return {
    r: g[`${side}Width`] / 2,

    points: [
      ...bezier(p(x, j), p(ax, j), p(ax, j - bend * 0.45), end),
      ...line(end, p(ax, j - h)).slice(1),
    ],
  };
}

function segments(points: Point[]): Segment[] {
  return points.slice(1).flatMap((z, i) => {
    const a = points[i];

    const dx = z.x - a.x;
    const dy = z.y - a.y;
    const l = Math.hypot(dx, dy);

    if (l <= 0.0001) return [];

    return [{ a, dx, dy, l }];
  });
}

// Find the nearest point on the branch.
// v: signed perpendicular distance.
// d: distance from the nearest point.

function closest(x: number, y: number, ss: Segment[]) {
  let best = Infinity;
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

      v = (-px * s.dy + py * s.dx) / s.l;
    }
  }

  return {
    d: Math.sqrt(best),
    v,
  };
}

// ─────────────────────────────────────────
// Rasterization
// ─────────────────────────────────────────

function buildGeometry(g: typeof homeSilhouette) {
  const branches: Branch[] = [
    arm("left", g),
    arm("right", g),
    {
      r: g.stemWidth / 2,
      points: [p(210, stemBaseY), p(210, 423 - g.height)],
    },
  ];

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

        owner[i] = index;

        values.push({ ...q, i });
      }
    }

    return { b, values };
  });

  return { fields, owner };
}

function drawCactusRelief(
  out: CanvasRenderingContext2D,
  ink: Ink,
  silhouette: Silhouette,
) {
  const { fields, owner } = buildGeometry(silhouettes[silhouette]);
  const image = out.createImageData(W, H);
  const pitch = 6;

  fields.forEach(({ b, values }, index) => {
    for (const point of values) {
      if (owner[point.i] !== index) continue;

      const x = point.i % W;
      const y = Math.floor(point.i / W);
      const across = (point.v + b.r) / (2 * b.r);
      const litFace = Math.exp(-(((across - 0.71) / 0.34) ** 2));
      const rimLight = Math.exp(-(((across - 0.08) / 0.16) ** 2));
      const rib = 0.85 + 0.15 * Math.cos((point.v / 12) * Math.PI * 2);
      const density = (0.25 + 0.72 * litFace + 0.36 * rimLight) * rib;
      const cell = sampleGlyphCell(
        Math.floor(x / pitch),
        Math.floor(y / pitch),
      );
      const mark =
        cell.rank < 16 + density * 39 &&
        Math.abs(mod(x + 0.5, pitch) / pitch - 0.5 - cell.scatterX) < 0.45 &&
        Math.abs(mod(y + 0.5, pitch) / pitch - 0.5 - cell.scatterY) < 0.47;
      const baseFade = Math.min(1, (stemBaseY - y) / 9);
      const alpha = mark ? 0.42 + density * 0.56 : 0.12 + density * 0.13;
      const offset = point.i * 4;
      image.data[offset] = ink[0];
      image.data[offset + 1] = ink[1];
      image.data[offset + 2] = ink[2];
      image.data[offset + 3] = 255 * alpha * baseFade;
    }
  });

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

function renderCactus(
  canvas: HTMLCanvasElement,
  inkColor: Ink,
  silhouette: Silhouette,
) {
  const out = canvas.getContext("2d");

  if (!out) return;

  const key = `${silhouette}:${inkColor.join(",")}`;

  let bitmap = bitmaps.get(key);

  if (!bitmap) {
    const result = document.createElement("canvas");

    result.width = W;
    result.height = H;

    const target = result.getContext("2d");

    if (!target) {
      throw new Error("Canvas 2D unavailable");
    }

    drawCactusRelief(target, inkColor, silhouette);

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
  silhouette?: Silhouette;
};

function CactusLayer({
  inkColor,
  mode,
  width,
  className,
  filterClassName,
  silhouette,
}: {
  inkColor: Ink;
  mode: "light" | "dark";
  width: number | string;
  className?: string;
  filterClassName?: string;
  silhouette: Silhouette;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      renderCactus(ref.current, inkColor, silhouette);
    }
  }, [inkColor, silhouette]);

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
  silhouette = "home",
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
        silhouette={silhouette}
        filterClassName={lightFilter}
      />
      <CactusLayer
        inkColor={inks.dark}
        mode="dark"
        width={width}
        className={className}
        silhouette={silhouette}
      />
    </>
  );
}
