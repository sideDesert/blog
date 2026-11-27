import { campsiteLayers, campsitePlants } from "./Campsite";
import { yuccaLayer } from "./DesertDetails";
import type { DitherStyle } from "./ditherCanvas";
import { fieldNotesLayers } from "./FieldNotes";
import { fieldNotesPlants } from "./FieldNotesPlants";
import { eastForegroundBoulderLayers } from "./foregroundBoulders";
import { radioTowerLayers } from "./RadioTower";
import { blogStars, projectStars } from "./referenceStars";
import type { Plant } from "./SceneScenery";
import {
	drawCableSpool,
	drawFloorCable,
	drawHangingRope,
	drawLampBulb,
	drawLampMount,
	drawLampRim,
	drawLampShade,
	drawLamplight,
	drawPostHook,
	drawShopLightSpill,
	drawToolRack,
	drawWorkbenchShadow,
	awningLayers,
	awningEquipmentCaseLayers,
	benchBinLayers,
	benchCableLayers,
	benchSupplyLayers,
	hangingToolLayers,
	leanToCrateLayers,
	shelfStockLayers,
	shopCrateLayers,
	shopEquipmentCaseLayers,
} from "./Shop";
import {
	benchRadioLayers,
	cabinetLayers,
	shelfFrameLayers,
	workbenchLayers,
} from "./ShopFurniture";
import { shopTimberLayers } from "./ShopTimber";
import {
	distantRidgeLayers,
	mesaStrataLayers,
	drawEasternTerrace,
	drawForecourtRipples,
	drawMesaFaces,
	drawTerraceFaces,
	drawTowerKnoll,
	drawValleyBanks,
	drawWestBoulder,
	drawWorkshopForecourt,
	drawWorkshopTerrain,
	eastRidgeLayers,
	workshopPebbleLayers,
	workshopRockLayers,
	westValleyLayers,
	westHoodooLayers,
} from "./WorkshopTerrain";

const workshopPlants = [
	{
		id: "plant-cactus",
		label: "Cactus beside the shop",
		kind: "cactus",
		x: 14.95,
		y: 80.2,
		width: 6.6,
		silhouette: "workshop",
	},
	{
		id: "plant-west-grass",
		label: "West grass",
		kind: "grass",
		variant: "sparse",
		x: 6.25,
		y: 75.5,
		width: 2.7,
	},
	{
		id: "plant-lean-to-grass",
		label: "Grass by the lean-to",
		kind: "grass",
		variant: "leaning",
		x: 18.7,
		y: 79.2,
		width: 2.5,
	},
	{
		id: "plant-knoll-grass",
		label: "Grass below the tower knoll",
		kind: "grass",
		variant: "spreading",
		x: 73.9,
		y: 76.7,
		width: 3,
	},
	{
		id: "plant-boulder-grass",
		label: "Grass behind the boulders",
		kind: "grass",
		variant: "open",
		x: 84.6,
		y: 82.2,
		width: 2.5,
	},
	{
		id: "plant-slope-grass",
		label: "Grass on the east slope",
		kind: "grass",
		variant: "sparse",
		x: 89.8,
		y: 75.9,
		width: 2.4,
	},
	{
		id: "plant-east-grass",
		label: "Grass at the east edge",
		kind: "grass",
		variant: "fan",
		x: 93.9,
		y: 80.5,
		width: 3.6,
	},
] satisfies readonly Plant[];

const workshopLayers = [
	{ id: "terrain", label: "Terrain", draw: drawWorkshopTerrain },
	{ id: "mesa-faces", label: "Main mesa faces", draw: drawMesaFaces },
	...mesaStrataLayers,
	...westHoodooLayers,
	...distantRidgeLayers,
	{ id: "tower-knoll", label: "Tower knoll faces", draw: drawTowerKnoll },
	{ id: "valley-banks", label: "Valley banks", draw: drawValleyBanks },
	...westValleyLayers,
	{ id: "terrace-faces", label: "Rock shelf faces", draw: drawTerraceFaces },
	{
		id: "eastern-terrace",
		label: "Rock shelf below the east spires",
		draw: drawEasternTerrace,
	},
	...eastRidgeLayers,
	{
		id: "forecourt",
		label: "Sand in front of the shop",
		draw: drawWorkshopForecourt,
	},
	{
		id: "forecourt-ripples",
		label: "Sand ripples in front of the shop",
		draw: drawForecourtRipples,
	},
	...radioTowerLayers,
	{
		id: "west-boulder",
		label: "West foreground boulder",
		draw: drawWestBoulder,
	},
	...eastForegroundBoulderLayers,
	...workshopRockLayers,
	...workshopPebbleLayers,
	yuccaLayer("west-yucca", "West yucca", [177, 459, 66, 38]),
	yuccaLayer("awning-yucca", "Yucca near the awning", [696, 405, 42, 24]),
	yuccaLayer("forecourt-yucca", "Yucca by the forecourt", [666, 467, 54, 32]),
	...shopTimberLayers,
	...leanToCrateLayers,
	...shelfStockLayers,
	...shelfFrameLayers,
	{ id: "tool-rail", label: "Tool rail", draw: drawToolRack },
	...hangingToolLayers,
	{
		id: "light-spill",
		label: "Lamplight on the sand",
		draw: drawShopLightSpill,
	},
	{ id: "lamplight", label: "Lamplight", draw: drawLamplight },
	{ id: "lamp-mount", label: "Lamp cable and mount", draw: drawLampMount },
	{ id: "lamp-shade", label: "Lamp shade", draw: drawLampShade },
	{ id: "lamp-rim", label: "Lit rim of the lamp", draw: drawLampRim },
	{ id: "lamp", label: "Lamp bulb", draw: drawLampBulb },
	{ id: "bench-shadow", label: "Workbench shadow", draw: drawWorkbenchShadow },
	...workbenchLayers,
	...benchRadioLayers,
	...benchSupplyLayers,
	...awningLayers,
	{ id: "rope", label: "Hanging rope", draw: drawHangingRope },
	{ id: "post-hook", label: "Hook beside the rope", draw: drawPostHook },
	{ id: "cable-spool", label: "Cable spool", draw: drawCableSpool },
	...benchCableLayers,
	{ id: "floor-cable", label: "Floor cable", draw: drawFloorCable },
	...shopCrateLayers,
	...shopEquipmentCaseLayers,
	...awningEquipmentCaseLayers,
	...cabinetLayers,
	...benchBinLayers,
] as const;

export type DustPatch = {
	id: `dust-${string}`;
	label: string;
	x: number;
	y: number;
	mark: ":" | "-";
};

function dustPatches(
	patches: readonly [DustPatch["id"], string, number, number][],
): DustPatch[] {
	return patches.map(([id, label, x, y], index) => ({
		id,
		label,
		x,
		y,
		mark: index % 2 ? "-" : ":",
	}));
}

export const scenes = {
	projects: {
		layers: workshopLayers,
		plants: workshopPlants,
		dust: dustPatches([
			["dust-west-cactus", "Dust by the west cactus", 124, 443],
			["dust-lean-to", "Dust in front of the lean-to", 304, 435],
			["dust-floor-cable", "Dust by the floor cable", 566, 452],
			["dust-east-boulder", "Dust by the east boulder", 823, 415],
		]),
		celestial: { x: 75.45, y: 14.55, width: 9.35 },
		stars: projectStars,
		clouds: [
			{
				id: "cloud-over-mesa",
				label: "Wisp above the main mesa",
				opacity: 0.94,
				x: 25,
				spread: 15,
				depth: 6.5,
				drift: 3,
				heights: [18, 18, 16.2, 16.2, 19.6],
			},
			{
				id: "cloud-west-slope",
				label: "Wisp beside the west slope",
				x: 7.6,
				spread: 7,
				depth: 4,
				drift: -4,
				heights: [30.2, 31, 31.6, 30.2, 29],
			},
			{
				id: "cloud-middle-mesa",
				label: "Wisp above the middle mesa",
				opacity: 0.92,
				x: 48.5,
				spread: 15.5,
				depth: 5.5,
				drift: 4,
				heights: [36.6, 37.2, 33.6, 32.8, 36.4],
			},
			{
				id: "cloud-east-sky",
				label: "Wisp high in the east",
				opacity: 0.81,
				x: 85.8,
				spread: 13,
				depth: 5.5,
				drift: -3,
				heights: [30.4, 29.2, 26.2, 23.6, 23.4],
			},
			{
				id: "cloud-tower",
				label: "Wisp above the tower",
				x: 72.3,
				spread: 16.7,
				depth: 5.5,
				drift: 5,
				heights: [40.6, 42, 38.6, 39.4, 43.8],
			},
			{
				id: "cloud-east-spires",
				label: "Wisp above the east spires",
				x: 90.5,
				spread: 11.5,
				depth: 5,
				drift: -3,
				heights: [43.4, 46.4, 45, 42, 40.4],
			},
		],
		ditherStyle: "soft" satisfies DitherStyle,
		label: "A desert workshop with a radio tower, mesas and rocks",
	},
	blog: {
		layers: fieldNotesLayers,
		plants: fieldNotesPlants,
		dust: dustPatches([
			["dust-west-valley", "Dust on the west valley floor", 197, 425],
			["dust-valley-channel", "Dust below the valley channel", 369, 364],
			["dust-ledge", "Dust below the ledge", 501, 382],
			["dust-notebook", "Dust east of the notebook", 884, 363],
		]),
		celestial: { x: 74.95, y: 14.4, width: 7.3 },
		stars: blogStars,
		clouds: [
			{
				id: "cloud-west-cliffs",
				label: "Wisp above the west cliffs",
				opacity: 0.81,
				x: 20,
				spread: 13,
				depth: 8,
				drift: 3,
				heights: [18, 18.2, 16.4, 16.6, 17.4],
			},
			{
				id: "cloud-west-valley",
				label: "Wisp above the west valley",
				opacity: 0.42,
				x: 34.6,
				spread: 5.3,
				depth: 2.7,
				drift: -4,
				heights: [32.6, 32.4, 32, 31.5, 31.2],
			},
			{
				id: "cloud-valley",
				label: "Wisp above the valley",
				opacity: 0.85,
				x: 57.8,
				spread: 9.3,
				depth: 4.2,
				drift: 4,
				heights: [27.2, 27.3, 26.7, 26.2, 25.2],
			},
			{
				id: "cloud-low-valley",
				label: "Low wisp above the valley",
				x: 68.8,
				spread: 5,
				depth: 2.2,
				drift: -3,
				heights: [37, 37.1, 37, 36.5, 36.2],
			},
			{
				id: "cloud-east-lookout",
				label: "Wisp east of the lookout",
				opacity: 0.91,
				x: 93.1,
				spread: 8.5,
				depth: 4.8,
				drift: 3,
				heights: [27.2, 27.1, 26.1, 24.3, 23.3],
			},
		],
		ditherStyle: "soft" satisfies DitherStyle,
		label:
			"A field notebook on a ledge overlooking a winding trail and a stone lookout",
	},
	about: {
		layers: campsiteLayers,
		plants: campsitePlants,
		dust: dustPatches([
			["dust-camp-cactus", "Dust near the west cactus", 143, 428],
			["dust-tent", "Dust in front of the tent", 406, 440],
			["dust-campfire", "Dust east of the campfire", 725, 430],
			["dust-camp-rocks", "Dust near the east campsite rocks", 894, 449],
		]),
		celestial: { x: 61.4, y: 14, width: 10 },
		stars: undefined,
		clouds: undefined,
		ditherStyle: "fine" satisfies DitherStyle,
		label: "A tent and campfire in a quiet desert canyon",
	},
} as const;

export type WorkshopSceneName = keyof typeof scenes;
export type WorkshopLayer =
	| (typeof scenes)[WorkshopSceneName]["layers"][number]["id"]
	| (typeof scenes)[WorkshopSceneName]["plants"][number]["id"]
	| DustPatch["id"]
	| NonNullable<(typeof scenes)[WorkshopSceneName]["clouds"]>[number]["id"]
	| (typeof sceneryLayers)[number]["id"]
	| typeof defaultCloudLayer.id;

export const sceneryLayers = [
	{ id: "stars", label: "Star field" },
	{ id: "celestial", label: "Sun and moon" },
] as const;

export const defaultCloudLayer = {
	id: "clouds",
	label: "Cloud wisps",
} as const;
