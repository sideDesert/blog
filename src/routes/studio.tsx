import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";
import Landscape from "#/components/ascii-art/Landscape";
import { DEFAULT_CIRCLES } from "#/components/ascii-art/Sun";
import { DEFAULT_SUN_PALETTES } from "#/components/ascii-art/sun/palette";
import Terrain from "#/components/ascii-art/Terrain";
import { createInitialConfig } from "#/components/ascii-art/terrain/model";
import {
	createInitialState,
	terrainReducer,
} from "#/components/ascii-art/terrain/state";
import { useDesertAudioContext } from "#/components/audio/DesertAudioContext";
import Playground from "#/components/playground/Playground";
import { desertMain } from "#/components/ui/desert-layout";
import { pageHead } from "#/lib/pageHead";
import { readStudioSave, updateStudioSave } from "#/lib/studioStorage";

export const Route = createFileRoute("/studio")({
	component: Studio,
	head: () =>
		pageHead(
			"/studio",
			"Desert Playground | sideDesert",
			"Edit the desert landscape, sun, and sound.",
		),
});

function readStudio() {
	const saved = readStudioSave({ migrate: true });
	return {
		terrain: saved.terrain ?? createInitialConfig(),
		palettes: saved.palettes ?? DEFAULT_SUN_PALETTES,
		circles: saved.circles ?? DEFAULT_CIRCLES,
		showBounds: saved.showBounds ?? false,
	};
}

function Studio() {
	const [saved, setSaved] = useState<ReturnType<typeof readStudio>>();

	useEffect(() => {
		setSaved(readStudio());
	}, []);

	return (
		<main className={desertMain}>
			<header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-(--rule) py-5">
				<h1 className="text-[1.625rem] font-semibold">Desert Playground</h1>
				<Link to="/" className="underline underline-offset-4">
					Back to home
				</Link>
			</header>
			{saved ? (
				<StudioWorkspace saved={saved} />
			) : (
				<output className="py-5">Loading playground…</output>
			)}
		</main>
	);
}

function StudioWorkspace({ saved }: { saved: ReturnType<typeof readStudio> }) {
	const [terrainState, terrainDispatch] = useReducer(
		terrainReducer,
		saved.terrain,
		createInitialState,
	);
	const [palettes, setPalettes] = useState(saved.palettes);
	const [circles, setCircles] = useState(saved.circles);
	const [showBounds, setShowBounds] = useState(saved.showBounds);
	const lastSaved = useRef(saved);
	const audio = useDesertAudioContext();
	const terrain = terrainState.config;

	useEffect(() => {
		const previous = lastSaved.current;
		const patch: Parameters<typeof updateStudioSave>[0] = {};
		if (previous.terrain !== terrain) patch.terrain = terrain;
		if (previous.palettes !== palettes) patch.palettes = palettes;
		if (previous.circles !== circles) patch.circles = circles;
		if (previous.showBounds !== showBounds) patch.showBounds = showBounds;
		if (Object.keys(patch).length > 0) updateStudioSave(patch);
		lastSaved.current = { terrain, palettes, circles, showBounds };
	}, [terrain, palettes, circles, showBounds]);

	return (
		<div className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,25rem)]">
			<div className="sticky top-0 z-10 aspect-2/1 min-w-0 self-start bg-background">
				<Landscape
					renderTerrain={(color) => (
						<Terrain
							state={terrainState}
							dispatch={terrainDispatch}
							color={color}
						/>
					)}
					sun={{ palettes, circles, showBounds }}
				/>
			</div>
			<Playground
				terrainState={terrainState}
				terrainDispatch={terrainDispatch}
				sunPalettes={palettes}
				onSunPalettesChange={setPalettes}
				sunCircles={circles}
				onSunCirclesChange={setCircles}
				showSunBounds={showBounds}
				onShowSunBoundsChange={setShowBounds}
				audioPlaying={audio.playing}
				audioSettings={audio.settings}
				onAudioToggle={audio.toggle}
				onAudioUpdate={audio.update}
				className="border border-(--rule) lg:max-h-[max(25rem,calc(100svh-11rem))]"
			/>
		</div>
	);
}
