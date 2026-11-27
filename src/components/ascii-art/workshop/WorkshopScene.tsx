import { useEffect, useMemo, useRef, useState } from "react";
import { NightStars } from "../NightStars";
import { useDesertColor } from "../useDesertColor";
import { useDesertTheme } from "../useDesertTheme";
import { campfireLightLayers } from "./Campsite";
import {
	type DitherPaint,
	readDesertInks,
	workshopHeight,
	workshopWidth,
} from "./ditherCanvas";
import { DustGlyphs, settleDust, stirDust } from "./DustGlyphs";
import { fieldNotesDither } from "./FieldNotes";
import {
	daylightNotebookDetails,
	drawDaylightPage,
	notebookPaperFaces,
} from "./FieldNotesNotebook";
import {
	beaconPatch,
	createPatch,
	lampLayers,
	lampPatch,
	motionPatches,
	paintWorkshop,
} from "./paintScene";
import {
	radioTowerDither,
	towerAntenna,
	towerSignalLayers,
} from "./RadioTower";
import { SceneCelestial, SceneClouds, ScenePlants } from "./SceneScenery";
import { scenes, type WorkshopLayer, type WorkshopSceneName } from "./scenes";
import { ShootingStar } from "./ShootingStar";
import "./workshop-motion.css";

const lampFlicker = [0.28, 0.82, 0.48, 1, 0.72, 1];

const lampRimDetail = "M453 337q17-2.5 38-.5l-1 4.5q-18 2-36 0Z";
const benchHardwareDetail = "M402 367H427V382H402ZM426 392H452V412H426Z";

const projectsDither = [
	...radioTowerDither,
	{
		path: `M381 323H530V403H559V423H498V413H423V406H381Z ${lampRimDetail} ${benchHardwareDetail}`,
		left: 381,
		top: 323,
		right: 559,
		bottom: 423,
	},
	{
		path: benchHardwareDetail,
		left: 402,
		top: 367,
		right: 452,
		bottom: 412,
		pitchScale: 0.63,
		style: "fine",
	},
	{
		path: lampRimDetail,
		left: 453,
		top: 334,
		right: 491,
		bottom: 343,
		pitchScale: 0.71,
		style: "fine",
	},
	{ path: "M337 338h41v68h-41Z", left: 337, top: 338, right: 378, bottom: 406 },
] as const;

export function WorkshopScene({
	scene = "projects",
	hidden,
	dither = true,
}: {
	scene?: WorkshopSceneName;
	hidden?: ReadonlySet<WorkshopLayer>;
	dither?: boolean;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const drawBeacon = useRef<((brightness: number) => void) | undefined>(
		undefined,
	);
	const beaconTimer = useRef<number | undefined>(undefined);
	const { colorEnabled, toggleColor } = useDesertColor();
	const theme = useDesertTheme();
	const daylight = theme === "light";
	const [motion, setMotion] = useState(false);
	const [displayScale, setDisplayScale] = useState(1);
	const rasterScale = dither ? displayScale : 1;
	const { layers, plants, dust, label, celestial, stars, clouds, ditherStyle } =
		scenes[scene];
	const visibleClouds = useMemo(() => {
		const visible = clouds?.filter(({ id }) => !hidden?.has(id));
		return visible?.length === clouds?.length ? clouds : visible;
	}, [clouds, hidden]);
	const hasTower =
		scene === "projects" &&
		!hidden?.has(towerAntenna) &&
		!hidden?.has(towerSignalLayers[0]);
	const visibleDust = dust.filter(({ id }) => !hidden?.has(id));
	const hasDust = visibleDust.length > 0;

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
		const preference = window.matchMedia(
			"(prefers-reduced-motion: no-preference)",
		);
		const sync = () => setMotion(preference.matches);
		sync();
		preference.addEventListener("change", sync);
		return () => preference.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;
		ctx.setTransform(rasterScale, 0, 0, rasterScale, 0, 0);
		const paperFaces: string[] = [];
		const visibleLayers = layers.flatMap((layer) => {
			if (hidden?.has(layer.id)) return [];
			if (!daylight) return [layer];
			if (
				lampLayers.some((id) => id === layer.id) ||
				campfireLightLayers.some((id) => id === layer.id) ||
				layer.id === "notebook-paper-grain"
			)
				return [];
			const detail = daylightNotebookDetails.get(layer.id);
			if (detail) {
				return [
					{
						...layer,
						draw: (context: CanvasRenderingContext2D, seconds?: number) =>
							detail(context, dither, seconds),
					},
				];
			}
			const face = notebookPaperFaces.get(layer.id);
			if (!face) return [layer];
			paperFaces.push(face);
			return [
				{
					...layer,
					draw: (context: CanvasRenderingContext2D) =>
						drawDaylightPage(context, face, dither),
				},
			];
		});
		const paint: DitherPaint | undefined = dither
			? {
					style: ditherStyle,
					daylight,
					paperFaces,
					palette: colorEnabled
						? readDesertInks(ctx.canvas, theme === "dark")
						: undefined,
					detail:
						scene === "blog"
							? fieldNotesDither(visibleLayers.map(({ id }) => id))
							: scene === "projects"
								? projectsDither
								: undefined,
				}
			: undefined;
		paintWorkshop(ctx, visibleLayers, paint);

		const beacon = hasTower
			? createPatch(ctx, visibleLayers, beaconPatch, paint)
			: undefined;
		if (beacon) {
			const { x, y, width, height } = beaconPatch.bounds;
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

		const patches = motion
			? motionPatches[scene]
					.map((patch) => createPatch(ctx, visibleLayers, patch, paint))
					.filter((patch) => patch !== undefined)
			: [];
		const lamp =
			motion &&
			scene === "projects" &&
			visibleLayers.some(({ id }) => lampLayers.some((layer) => id === layer))
				? createPatch(ctx, visibleLayers, lampPatch, paint)
				: undefined;
		let frameId: number | undefined;
		let lastPaint: number | undefined;
		let seconds = 0;
		let flickerAt = 5 + Math.random() * 2;
		let flickerStarted = -Infinity;
		let brightness = 1;
		const amountFor = (layer: WorkshopLayer) =>
			lampLayers.some((id) => id === layer) ? brightness : seconds;
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
			window.clearTimeout(beaconTimer.current);
			drawBeacon.current = undefined;
		};
	}, [
		layers,
		hidden,
		dither,
		ditherStyle,
		colorEnabled,
		theme,
		daylight,
		scene,
		motion,
		hasTower,
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
			onPointerMove={motion && hasDust ? stirDust : undefined}
			onPointerLeave={hasDust ? settleDust : undefined}
			onPointerCancel={hasDust ? settleDust : undefined}
		>
			<canvas
				ref={canvas}
				width={workshopWidth * rasterScale}
				height={workshopHeight * rasterScale}
				role="img"
				aria-label={
					daylight && scene === "about"
						? "A tent in a sunny desert canyon"
						: label
				}
				className={`block h-full w-full ${!colorEnabled && (dither ? "not-dark:[image-rendering:pixelated]" : "grayscale")}`}
			/>
			{!hidden?.has("clouds") && visibleClouds?.length !== 0 && (
				<SceneClouds clouds={visibleClouds} color={colorEnabled} />
			)}
			{!daylight && !hidden?.has("stars") && (
				<>
					<NightStars stars={stars} verticalScale={stars ? 1 : 0.62} />
					{scene === "about" && motion && <ShootingStar />}
				</>
			)}
			{!hidden?.has("celestial") && (
				<SceneCelestial
					celestial={celestial}
					theme={theme}
					color={colorEnabled}
					onToggleColor={toggleColor}
				/>
			)}
			<ScenePlants
				plants={plants.filter(({ id }) => !hidden?.has(id))}
				color={colorEnabled}
			/>
			{hasDust && <DustGlyphs patches={visibleDust} />}
			{hasTower && (
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
