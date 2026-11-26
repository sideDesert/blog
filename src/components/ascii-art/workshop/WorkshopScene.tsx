import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { campsiteLayers, campsitePlants } from "./Campsite";
import { type DitherStyle, ditherCanvas } from "./ditherCanvas";
import { fieldNotesLayers, fieldNotesPlants } from "./FieldNotes";
import { blogStars, projectStars } from "./referenceStars";
import {
	type Plant,
	SceneClouds,
	ScenePlants,
	SceneSky,
	SceneWind,
} from "./SceneScenery";
import {
	drawAwning,
	drawAwningSupports,
	drawBenchRadio,
	drawBenchSupplies,
	drawCableSpool,
	drawDesertTufts,
	drawDrawerCabinet,
	drawEquipmentCases,
	drawFloorCable,
	drawHangingRope,
	drawLamp,
	drawLamplight,
	drawLeanTo,
	drawPebbles,
	drawRadioTower,
	drawRocks,
	drawRoofTruss,
	drawShelves,
	drawStorageCrates,
	drawToolRack,
	drawTowerShelter,
	drawTowerSignal,
	drawUnderBenchBins,
	drawWorkbench,
	drawWorkbenchShadow,
	drawWorkshopFrame,
} from "./WorkshopProps";
import {
	drawDistantRidge,
	drawValleyBanks,
	drawWorkshopTerrain,
} from "./WorkshopTerrain";
import "./workshop-motion.css";

function drawWind(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.strokeStyle = "#5c574c";
	ctx.lineWidth = 0.75;
	ctx.setLineDash([0.4, 2, 0.75, 4]);
	ctx.stroke(
		new Path2D(
			"M72 269c93-16 154 6 242-9m241 43c69 21 125 3 200-9m30 86c67-6 138-11 208 3",
		),
	);
	ctx.restore();
}

const workshopPlants = [
	{ kind: "cactus", x: 15, y: 81.2, width: 6.6 },
	{ kind: "grass", variant: "sparse", x: 5.2, y: 76, width: 2.7 },
	{ kind: "grass", variant: "leaning", x: 29, y: 81, width: 2.4 },
	{ kind: "grass", variant: "spreading", x: 71.5, y: 83, width: 3.1 },
	{ kind: "grass", variant: "open", x: 84.3, y: 83, width: 3 },
	{ kind: "grass", variant: "sparse", x: 90.4, y: 77, width: 2.4 },
	{ kind: "grass", variant: "leaning", x: 94.9, y: 81, width: 3.8 },
] satisfies readonly Plant[];

function drawWorkshopTufts(ctx: CanvasRenderingContext2D) {
	drawDesertTufts(ctx, [
		[176, 460, 70, 43],
		[666, 467, 54, 34],
		[704, 410, 42, 24],
	]);
}

const workshopLayers = [
	{ id: "terrain", label: "Terrain", draw: drawWorkshopTerrain },
	{ id: "distant-ridge", label: "Distant ridge faces", draw: drawDistantRidge },
	{ id: "valley-banks", label: "Valley banks", draw: drawValleyBanks },
	{ id: "wind", label: "Wind", draw: drawWind },
	{ id: "tower", label: "Radio tower", draw: drawRadioTower },
	{
		id: "tower-shelter",
		label: "Tower equipment shelter",
		draw: drawTowerShelter,
	},
	{ id: "signal", label: "Tower signal", draw: drawTowerSignal },
	{ id: "rocks", label: "Rocks", draw: drawRocks },
	{ id: "pebbles", label: "Pebbles", draw: drawPebbles },
	{ id: "tufts", label: "Foreground yuccas", draw: drawWorkshopTufts },
	{ id: "frame", label: "Workshop frame", draw: drawWorkshopFrame },
	{ id: "roof-truss", label: "Roof truss", draw: drawRoofTruss },
	{ id: "lean-to", label: "Lean-to", draw: drawLeanTo },
	{ id: "shelves", label: "Shelves", draw: drawShelves },
	{ id: "wrenches", label: "Tool rack", draw: drawToolRack },
	{ id: "lamplight", label: "Lamplight", draw: drawLamplight },
	{ id: "lamp", label: "Lamp", draw: drawLamp },
	{ id: "bench-shadow", label: "Workbench shadow", draw: drawWorkbenchShadow },
	{ id: "bench", label: "Workbench", draw: drawWorkbench },
	{ id: "bench-radio", label: "Bench radio", draw: drawBenchRadio },
	{ id: "supplies", label: "Workbench supplies", draw: drawBenchSupplies },
	{ id: "awning-supports", label: "Awning supports", draw: drawAwningSupports },
	{ id: "awning", label: "Cloth awning", draw: drawAwning },
	{ id: "rope", label: "Hanging rope", draw: drawHangingRope },
	{ id: "cable-spool", label: "Cable spool", draw: drawCableSpool },
	{ id: "floor-cable", label: "Floor cable", draw: drawFloorCable },
	{ id: "crates", label: "Crates", draw: drawStorageCrates },
	{ id: "equipment-cases", label: "Equipment cases", draw: drawEquipmentCases },
	{ id: "drawer-cabinet", label: "Drawer cabinet", draw: drawDrawerCabinet },
	{ id: "bench-bins", label: "Bins under the bench", draw: drawUnderBenchBins },
] as const;

export const scenes = {
	projects: {
		layers: workshopLayers,
		plants: workshopPlants,
		celestial: { x: 75.45, y: 14.55, width: 9.35 },
		stars: projectStars,
		clouds: [
			{
				x: 27,
				y: 15.8,
				spread: 15,
				depth: 8,
				drift: 3,
				curve: { slope: 0.7, bend: 3.8 },
			},
			{
				x: 6,
				y: 31.5,
				spread: 8,
				depth: 5,
				drift: -4,
				curve: { slope: -2, bend: 0.5 },
			},
			{
				x: 47,
				y: 34.3,
				spread: 13,
				depth: 7,
				drift: 4,
				curve: { slope: -0.8, bend: 3.1 },
			},
			{
				x: 88,
				y: 26.8,
				spread: 13,
				depth: 7,
				drift: -3,
				curve: { slope: -5, bend: -1 },
			},
			{
				x: 72,
				y: 38.8,
				spread: 15,
				depth: 6,
				drift: 5,
				curve: { slope: 0, bend: 4 },
			},
		],
		windLayer: "wind",
		ditherStyle: "fine" satisfies DitherStyle,
		label: "A desert workshop with a radio tower, mesas and rocks",
	},
	blog: {
		layers: fieldNotesLayers,
		plants: fieldNotesPlants,
		celestial: { x: 74.95, y: 14.4, width: 7.3 },
		stars: blogStars,
		clouds: [
			{
				x: 21,
				y: 16,
				spread: 13,
				depth: 9,
				drift: 3,
				curve: { slope: -0.4, bend: 2.8 },
			},
			{
				x: 35,
				y: 32,
				spread: 6,
				depth: 3,
				drift: -4,
				curve: { slope: -0.4, bend: 0.5 },
			},
			{
				x: 58,
				y: 27.1,
				spread: 9,
				depth: 5,
				drift: 4,
				curve: { slope: -1.3, bend: 0.2 },
			},
			{
				x: 69,
				y: 38,
				spread: 5,
				depth: 2.5,
				drift: -3,
				curve: { slope: 0.2, bend: 0.1 },
			},
			{
				x: 94,
				y: 26.4,
				spread: 8,
				depth: 6,
				drift: 3,
				curve: { slope: -3.5, bend: 0 },
			},
		],
		windLayer: "dust",
		ditherStyle: "soft" satisfies DitherStyle,
		label:
			"A field notebook on a ledge overlooking a winding trail and a stone lookout",
	},
	about: {
		layers: campsiteLayers,
		plants: campsitePlants,
		celestial: { x: 61.4, y: 14, width: 10 },
		stars: undefined,
		clouds: undefined,
		windLayer: "camp-wind",
		ditherStyle: "fine" satisfies DitherStyle,
		label: "A tent and campfire in a quiet desert canyon",
	},
} as const;

export type WorkshopSceneName = keyof typeof scenes;
export type WorkshopLayer =
	| (typeof scenes)[WorkshopSceneName]["layers"][number]["id"]
	| "sky"
	| "clouds"
	| "plants";

export const sceneryLayers = [
	{ id: "sky", label: "Stars and sun or moon" },
	{ id: "clouds", label: "Cloud wisps" },
	{ id: "plants", label: "Cactus and grasses" },
] as const;

const width = 1000;
const height = 500;
const beaconBounds = { x: 648, y: 216, width: 76, height: 54 };
type BeaconPhase = "idle" | "off" | "bright";

const dustPatches = {
	projects: [
		[13, 87],
		[33, 84],
		[59, 90],
		[81, 82],
	],
	blog: [
		[20, 83],
		[38, 73],
		[60, 79],
		[87, 72],
	],
	about: [
		[14, 84],
		[48, 87],
		[73, 82],
		[91, 87],
	],
};

function nudgeDust(event: PointerEvent<HTMLDivElement>) {
	if (event.pointerType !== "mouse") return;
	const stage = event.currentTarget;
	const bounds = stage.getBoundingClientRect();
	const x = ((event.clientX - bounds.left) / bounds.width) * 100;
	const y = ((event.clientY - bounds.top) / bounds.height) * 100;
	for (const patch of stage.querySelectorAll<HTMLElement>(
		"[data-dust-patch]",
	)) {
		const dx = x - Number.parseFloat(patch.style.left);
		const dy = y - Number.parseFloat(patch.style.top);
		patch.toggleAttribute("data-disturbed", Math.hypot(dx, dy * 0.6) < 12);
	}
}

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
	const {
		layers,
		plants,
		label,
		celestial,
		stars,
		clouds,
		windLayer,
		ditherStyle,
	} = scenes[scene];
	const [beacon, setBeacon] = useState<BeaconPhase>("idle");
	const beaconTimer = useRef<number | undefined>(undefined);
	const hasTower =
		scene === "projects" && !hidden?.has("tower") && !hidden?.has("signal");
	const hasWind = !hidden?.has(windLayer);
	const phase = hasTower ? beacon : "idle";
	const paintPlan = useMemo(
		() => ({ layers, hidden, dither, ditherStyle, hasTower }),
		[layers, hidden, dither, ditherStyle, hasTower],
	);
	const beaconCache = useRef<{
		plan: typeof paintPlan;
		frames: Map<BeaconPhase, ImageData>;
	} | null>(null);

	useEffect(() => () => window.clearTimeout(beaconTimer.current), []);

	function blinkBeacon() {
		window.clearTimeout(beaconTimer.current);
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setBeacon("bright");
			beaconTimer.current = window.setTimeout(() => setBeacon("idle"), 600);
			return;
		}
		const flashes = 2 + Number(Math.random() >= 0.5);
		let phase = 0;
		const next = () => {
			if (phase === 2 * flashes) {
				setBeacon("idle");
				return;
			}
			const isLit = phase % 2 === 1;
			setBeacon(isLit ? "bright" : "off");
			phase++;
			beaconTimer.current = window.setTimeout(next, isLit ? 250 : 200);
		};
		next();
	}

	useEffect(() => {
		const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;
		const { layers, hidden, dither, ditherStyle, hasTower } = paintPlan;
		const bounds = beaconBounds;
		if (beaconCache.current?.plan !== paintPlan) {
			beaconCache.current = hasTower
				? { plan: paintPlan, frames: new Map() }
				: null;
		}
		const frames = beaconCache.current?.frames;
		const cached = frames?.get(phase);
		if (cached) {
			ctx.putImageData(cached, bounds.x, bounds.y);
			return;
		}

		ctx.clearRect(0, 0, width, height);
		for (const layer of layers) {
			if (hidden?.has(layer.id)) continue;
			ctx.save();
			if (layer.id === "signal" && hasTower) {
				if (phase !== "off") drawTowerSignal(ctx, phase === "bright");
			} else {
				layer.draw(ctx);
			}
			ctx.restore();
		}
		if (dither) ditherCanvas(ctx, ditherStyle);
		frames?.set(
			phase,
			ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
		);
	}, [paintPlan, phase]);

	return (
		<div
			className="workshop-scene @container relative self-start overflow-hidden"
			onPointerMove={nudgeDust}
			onPointerLeave={(event) => {
				for (const patch of event.currentTarget.querySelectorAll(
					"[data-disturbed]",
				)) {
					patch.removeAttribute("data-disturbed");
				}
			}}
		>
			<div className="h-full" role="img" aria-label={label}>
				<canvas
					ref={canvas}
					width={width}
					height={height}
					className={`block h-full w-full ${dither ? "invert dark:invert-0" : ""}`}
				/>
				{!hidden?.has("clouds") && <SceneClouds clouds={clouds} />}
				{!hidden?.has("sky") && (
					<SceneSky celestial={celestial} stars={stars} />
				)}
				{hasWind && <SceneWind />}
				{!hidden?.has("plants") && <ScenePlants plants={plants} />}
				{hasWind &&
					dustPatches[scene].map(([x, y], index) => (
						<div
							className="workshop-dust"
							key={x}
							data-dust-patch
							aria-hidden="true"
							style={{
								left: `${x}%`,
								top: `${y}%`,
								animationDelay: `${index * -2.1}s`,
							}}
						>
							<span>·</span>
							<span>:</span>
							<span>~</span>
							<span>′</span>
						</div>
					))}
			</div>
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
