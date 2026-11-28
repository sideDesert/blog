import { useAppearance } from "#/lib/appearance";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { afterDesertPaint } from "../afterDesertPaint";
import { DesertCelestial } from "../DesertCelestial";
import DesertTexture from "../DesertTexture";
import { NightStars } from "../NightStars";
import { TerrainArtwork } from "../terrain/Canvas";
import { createRidgeArtwork, terrainBand } from "../terrain/geometry";
import { useDesertMotion } from "../useDesertMotion";
import {
	type DitherPaint,
	readDesertInks,
	readMonochromeNightInks,
	workshopHeight,
	workshopWidth,
} from "./ditherCanvas";
import { DustGlyphs, settleDust, stirDust } from "./DustGlyphs";
import { createPatch, paintWorkshop } from "./paintScene";
import type { CanvasLayer } from "./sceneLayer";
import { SceneClouds, ScenePlants } from "./SceneScenery";
import type { Scene } from "./scenes";
import { ShootingStar } from "./ShootingStar";
import "./workshop-motion.css";

const lampFlicker = [0.28, 0.82, 0.48, 1, 0.72, 1];

export function WorkshopScene({
	scene,
	hidden,
	isolated,
	dither = true,
}: {
	scene: Scene;
	hidden?: ReadonlySet<string>;
	isolated?: string;
	dither?: boolean;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const drawBeacon = useRef<((brightness: number) => void) | undefined>(
		undefined,
	);
	const beaconTimer = useRef<number | undefined>(undefined);
	const { theme, colorEnabled, toggleColor } = useAppearance();
	const daylight = theme === "light";
	const motion = useDesertMotion();
	const [displayScale, setDisplayScale] = useState(1);
	const rasterScale = dither ? displayScale : 1;
	const visibleLayers = useMemo(
		() =>
			scene.layers.filter((layer) =>
				isolated === undefined ? !hidden?.has(layer.id) : layer.id === isolated,
			),
		[scene, hidden, isolated],
	);
	const ridge = visibleLayers.find((layer) => layer.kind === "ridge")?.ridge;
	const publicTerrain = useMemo(
		() => ridge && createRidgeArtwork(ridge),
		[ridge],
	);
	const clouds = useMemo(
		() => visibleLayers.filter((layer) => layer.kind === "cloud"),
		[visibleLayers],
	);
	const plants = visibleLayers.filter((layer) => layer.kind === "plant");
	const dust = visibleLayers.filter((layer) => layer.kind === "dust");
	const beaconLayer = visibleLayers.find(
		(layer) =>
			layer.kind === "paint" &&
			layer.beacon &&
			visibleLayers.some(({ id }) => id === layer.beacon?.requires),
	);
	const beaconRegion =
		beaconLayer?.kind === "paint"
			? beaconLayer.motion?.find(({ trigger }) => trigger === "beacon")
			: undefined;

	useEffect(() => {
		const element = canvas.current;
		if (!element) return;
		const measure = () =>
			setDisplayScale(
				element.clientWidth * window.devicePixelRatio > workshopWidth ? 2 : 1,
			);
		const size = new ResizeObserver(measure);
		size.observe(element);
		window.addEventListener("resize", measure);
		measure();
		return () => {
			size.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	useEffect(() => {
		const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;
		ctx.setTransform(rasterScale, 0, 0, rasterScale, 0, 0);
		const canvasLayers = visibleLayers
			.filter((layer) => layer.kind === "paint")
			.filter((layer) => !(daylight && layer.nightOnly));

		const ditherPaint: DitherPaint | undefined = dither
			? {
					daylight,
					paperFaces: daylight
						? canvasLayers.flatMap(({ paperFace }) =>
								paperFace ? [paperFace] : [],
							)
						: undefined,
					palette: colorEnabled
						? readDesertInks(ctx.canvas, !daylight)
						: undefined,
					nightInks:
						!daylight && !colorEnabled
							? readMonochromeNightInks(ctx.canvas)
							: undefined,
					detail:
						scene.detail === "layers"
							? [
									...new Set(
										canvasLayers.flatMap(({ detail }) =>
											detail ? [detail] : [],
										),
									),
								].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
							: scene.detail,
				}
			: undefined;
		const paint = { daylight, dither: ditherPaint };
		paintWorkshop(ctx, canvasLayers, paint);

		const regions = [
			...new Set(canvasLayers.flatMap(({ motion }) => motion ?? [])),
		];
		if (beaconRegion) {
			const beacon = createPatch(ctx, canvasLayers, beaconRegion, paint);
			if (beacon) {
				const { x, y, width, height } = beaconRegion;
				const idle = ctx.getImageData(
					x * rasterScale,
					y * rasterScale,
					width * rasterScale,
					height * rasterScale,
				);
				drawBeacon.current = (brightness) => {
					if (brightness === 1)
						ctx.putImageData(idle, x * rasterScale, y * rasterScale);
					else beacon(() => brightness);
				};
			}
		}

		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

		function startMotion() {
			if (!ctx) return;
			const patches = regions
				.filter(({ trigger }) => trigger === "frame")
				.map((region) => createPatch(ctx, canvasLayers, region, paint))
				.filter((patch) => patch !== undefined);
			const lampRegion = regions.find(({ trigger }) => trigger === "flicker");
			const lamp =
				lampRegion &&
				canvasLayers.some(
					({ brightness, motion }) =>
						brightness && motion?.includes(lampRegion),
				)
					? createPatch(ctx, canvasLayers, lampRegion, paint)
					: undefined;

			let frameId: number | undefined;
			let lastPaint: number | undefined;
			let seconds = 0;
			let flickerAt = 5 + Math.random() * 2;
			let flickerStarted = -Infinity;
			let brightness = 1;
			const amountFor = (layer: CanvasLayer) =>
				layer.brightness ? brightness : seconds;
			// Use the same compositing path for the first and subsequent steady frames.
			lamp?.(amountFor);

			function animate(timestamp: number) {
				lastPaint ??= timestamp;
				const elapsed = timestamp - lastPaint;
				if (elapsed >= 1000 / 24) {
					seconds += elapsed / 1000;
					if (lamp && seconds >= flickerAt) {
						flickerStarted = seconds;
						flickerAt = seconds + 5 + Math.random() * 2;
					}
					const flickerFrame = Math.floor((seconds - flickerStarted) / 0.075);
					const previousBrightness = brightness;
					brightness = lampFlicker[flickerFrame] ?? 1;
					for (const patch of patches) patch(amountFor);
					if (brightness !== previousBrightness) lamp?.(amountFor);
					lastPaint = timestamp;
				}
				frameId = requestAnimationFrame(animate);
			}

			const visibility =
				patches.length > 0 || lamp
					? new IntersectionObserver(([entry]) => {
							if (entry?.isIntersecting) {
								frameId ??= requestAnimationFrame(animate);
							} else if (frameId !== undefined) {
								cancelAnimationFrame(frameId);
								frameId = undefined;
								lastPaint = undefined;
							}
						})
					: undefined;
			visibility?.observe(ctx.canvas);
			return () => {
				visibility?.disconnect();
				if (frameId !== undefined) cancelAnimationFrame(frameId);
			};
		}

		let stopMotion: (() => void) | undefined;
		let cancelStart: (() => void) | undefined;
		const syncMotion = () => {
			cancelStart?.();
			stopMotion?.();
			stopMotion = undefined;
			if (!preference.matches) {
				cancelStart = afterDesertPaint(() => {
					stopMotion = startMotion();
				});
			}
		};
		syncMotion();
		preference.addEventListener("change", syncMotion);
		return () => {
			cancelStart?.();
			stopMotion?.();
			preference.removeEventListener("change", syncMotion);
			window.clearTimeout(beaconTimer.current);
			drawBeacon.current = undefined;
		};
	}, [
		visibleLayers,
		dither,
		colorEnabled,
		daylight,
		scene,
		beaconRegion,
		rasterScale,
	]);

	function blinkBeacon() {
		window.clearTimeout(beaconTimer.current);
		if (!motion) {
			drawBeacon.current?.(2);
			beaconTimer.current = window.setTimeout(
				() => drawBeacon.current?.(1),
				600,
			);
			return;
		}
		const flashes = 2 + Number(Math.random() >= 0.5);
		let phase = 0;
		function next() {
			if (phase === 2 * flashes) {
				drawBeacon.current?.(1);
				return;
			}
			const isLit = phase % 2 === 1;
			drawBeacon.current?.(isLit ? 2 : 0);
			phase++;
			beaconTimer.current = window.setTimeout(next, isLit ? 250 : 200);
		}
		next();
	}

	return (
		<div
			className="workshop-scene @container relative self-start overflow-hidden"
			data-color={colorEnabled}
			data-desert-motion={motion}
			onPointerMove={motion && dust.length > 0 ? stirDust : undefined}
			onPointerLeave={dust.length > 0 ? settleDust : undefined}
			onPointerCancel={dust.length > 0 ? settleDust : undefined}
		>
			{scene.layers.map((layer, index) => {
				// Ordered canvas layers share one raster surface, even when all are hidden.
				if (layer.kind === "paint") {
					return scene.layers[index - 1]?.kind !== "paint" ? (
						<canvas
							ref={canvas}
							width={workshopWidth * rasterScale}
							height={workshopHeight * rasterScale}
							role="img"
							key="canvas"
							aria-label={(daylight && scene.daylightLabel) || scene.label}
							className={`relative block h-full w-full ${!colorEnabled && (dither ? "not-dark:[image-rendering:pixelated]" : "grayscale")}`}
						/>
					) : null;
				}

				if (!visibleLayers.includes(layer)) return null;
				switch (layer.kind) {
					case "ridge":
						return (
							publicTerrain && (
								<div
									key={layer.id}
									className="pointer-events-none absolute inset-x-0 mask-[linear-gradient(#000_35%,#000b_62%,transparent_100%)]"
									style={{
										top: `${terrainBand.top}%`,
										height: `${terrainBand.height}%`,
									}}
								>
									<TerrainArtwork
										scene={publicTerrain}
										color={colorEnabled}
										decorative
									/>
								</div>
							)
						);
					case "sand":
						return (
							<div
								key={layer.id}
								className="pointer-events-none absolute inset-x-0 bottom-0 h-[19%]"
							>
								<DesertTexture layer="ground" color={colorEnabled} />
							</div>
						);
					case "default-clouds":
						return <SceneClouds key={layer.id} color={colorEnabled} />;
					case "cloud":
						return (
							clouds[0] === layer && (
								<SceneClouds
									key="clouds"
									clouds={clouds}
									color={colorEnabled}
								/>
							)
						);
					case "stars":
						return (
							!daylight && (
								<Fragment key={layer.id}>
									<NightStars
										stars={layer.stars}
										verticalScale={layer.stars ? 1 : 0.62}
									/>
									{layer.shootingStar && motion && <ShootingStar />}
								</Fragment>
							)
						);
					case "celestial":
						return (
							<DesertCelestial
								key={layer.id}
								theme={theme}
								motion={motion}
								color={colorEnabled}
								onToggleColor={toggleColor}
							/>
						);
					case "plant":
						return (
							plants[0] === layer && (
								<ScenePlants
									key="plants"
									plants={plants}
									color={colorEnabled}
								/>
							)
						);
					case "dust":
						return (
							dust[0] === layer && <DustGlyphs key="dust" patches={dust} />
						);
				}
				return null;
			})}
			{beaconRegion && (
				<button
					type="button"
					aria-label="Blink the radio tower beacon"
					title="Blink the radio tower beacon"
					className="absolute top-[55.5%] left-[68.1%] h-[21%] min-h-8 w-[5%] min-w-8 -translate-1/2 cursor-pointer rounded-sm focus-visible:outline-1 focus-visible:outline-offset-1"
					onClick={blinkBeacon}
				/>
			)}
		</div>
	);
}
