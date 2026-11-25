import { type Dispatch, useState } from "react";
import {
	CircleControls,
	DEFAULT_CIRCLES,
	type SunCircles,
} from "#/components/ascii-art/Sun";
import {
	createSunInk,
	DEFAULT_SUN_PALETTES,
	type SunPalette,
	type SunPalettes,
	type SunPaletteVariant,
} from "#/components/ascii-art/sun/palette";
import {
	controlButtonClass,
	PreviewControls,
	Sidebar,
	Slider,
	sectionHeadingClass,
	Toolbar,
} from "#/components/ascii-art/terrain/Controls";
import { parseTerrainConfig } from "#/components/ascii-art/terrain/model";
import type {
	TerrainAction,
	TerrainState,
} from "#/components/ascii-art/terrain/state";
import type { AudioSettings } from "#/lib/hooks/useDesertAudio";

const TABS = [
	{ key: "landscape", label: "Landscape" },
	{ key: "sun", label: "Sun" },
	{ key: "sound", label: "Sound" },
] as const;

type PlaygroundTab = (typeof TABS)[number]["key"];

const PALETTE_VARIANTS: { key: SunPaletteVariant; label: string }[] = [
	{ key: "lightColor", label: "Light + color" },
	{ key: "lightMonochrome", label: "Light + B/W" },
	{ key: "darkColor", label: "Dark + color" },
	{ key: "darkMonochrome", label: "Dark + B/W" },
];

const AUDIO_KEYS: (keyof AudioSettings)[] = ["wind", "sand", "gusts", "volume"];

function PaletteEditor({
	variant,
	label,
	palette,
	onChange,
}: {
	variant: SunPaletteVariant;
	label: string;
	palette: SunPalette;
	onChange: (patch: Partial<SunPalette>) => void;
}) {
	const ink = createSunInk(palette);

	return (
		<section>
			<h3 className={sectionHeadingClass}>{label}</h3>

			{(["lowHeat", "highHeat"] as const).map((stop) => (
				<div className="mb-2 flex items-center gap-2" key={stop}>
					<label className="min-w-20" htmlFor={`${variant}-${stop}`}>
						{stop === "lowHeat" ? "Low heat" : "High heat"}
					</label>
					<input
						className="h-7 w-10 cursor-pointer border border-border bg-surface p-0"
						id={`${variant}-${stop}`}
						type="color"
						value={palette[stop]}
						onChange={(event) => onChange({ [stop]: event.target.value })}
					/>
					<span className="text-muted-foreground">{palette[stop]}</span>
				</div>
			))}

			<div
				className="mt-1 h-2 border border-border"
				style={{
					backgroundImage: `linear-gradient(to right, ${ink(0)}, ${ink(1)})`,
				}}
				aria-hidden="true"
			/>
		</section>
	);
}

function LandscapeTools({
	state,
	dispatch,
}: {
	state: TerrainState;
	dispatch: Dispatch<TerrainAction>;
}) {
	function exportConfig() {
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(state.config, null, 2)], {
				type: "application/json",
			}),
		);
		const link = document.createElement("a");

		link.href = url;
		link.download = "terrain.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function importConfig(file: File) {
		try {
			const config = parseTerrainConfig(JSON.parse(await file.text()));
			if (!config) throw new Error("Invalid terrain");
			dispatch({ type: "importConfig", config });
		} catch {
			dispatch({ type: "importFailed" });
		}
	}

	function loadReference(file: File) {
		const reader = new FileReader();

		reader.onload = () =>
			dispatch({ type: "setReference", reference: String(reader.result) });
		reader.readAsDataURL(file);
	}

	return (
		<>
			<Toolbar
				drawingSeams={state.drawingSeams}
				hasDrawnSeams={state.config.drawnSeams.length > 0}
				dispatch={dispatch}
				onReferenceFile={loadReference}
				onExport={exportConfig}
				onImportFile={importConfig}
			/>

			{state.drawingSeams && (
				<p className="m-0 text-muted-foreground">
					Drag across the terrain and release to see the shadow.
				</p>
			)}
			{state.status && (
				<p className="m-0 text-muted-foreground">{state.status}</p>
			)}

			{state.reference && state.view.showReference && (
				<img
					className="block max-h-56 w-full border border-border object-contain"
					src={state.reference}
					alt="Terrain reference"
				/>
			)}

			<PreviewControls
				view={state.view}
				dither={state.render.dither}
				dispatch={dispatch}
			/>

			<Sidebar
				config={state.config}
				selectedId={state.selectedId}
				render={state.render}
				dispatch={dispatch}
				className="[&>section+section]:mt-4"
			/>
		</>
	);
}

function SunTools({
	palettes,
	onPalettesChange,
	circles,
	onCirclesChange,
	showBounds,
	onShowBoundsChange,
	copyState,
	onCopy,
}: {
	palettes: SunPalettes;
	onPalettesChange: (palettes: SunPalettes) => void;
	circles: SunCircles;
	onCirclesChange: (circles: SunCircles) => void;
	showBounds: boolean;
	onShowBoundsChange: (show: boolean) => void;
	copyState: "idle" | "copied" | "failed";
	onCopy: (text: string) => void;
}) {
	function updatePalette(
		variant: SunPaletteVariant,
		patch: Partial<SunPalette>,
	) {
		onPalettesChange({
			...palettes,
			[variant]: { ...palettes[variant], ...patch },
		});
	}

	function reset() {
		onPalettesChange(DEFAULT_SUN_PALETTES);
		onCirclesChange(DEFAULT_CIRCLES);
		onShowBoundsChange(false);
	}

	return (
		<>
			<p className="m-0 text-muted-foreground">
				Switch themes with the header toggle and click the sun to change color /
				B&amp;W.
			</p>

			{PALETTE_VARIANTS.map((variant) => (
				<PaletteEditor
					key={variant.key}
					variant={variant.key}
					label={variant.label}
					palette={palettes[variant.key]}
					onChange={(patch) => updatePalette(variant.key, patch)}
				/>
			))}

			<section>
				<h3 className={sectionHeadingClass}>Sun shape</h3>
				{(["A", "B", "C"] as const).map((name) => (
					<CircleControls
						key={name}
						name={name === "C" ? "Circle C (mask)" : `Circle ${name}`}
						circle={circles[name]}
						onChange={(circle) =>
							onCirclesChange({ ...circles, [name]: circle })
						}
					/>
				))}
				<label className="mt-3 flex gap-2">
					<input
						type="checkbox"
						checked={showBounds}
						onChange={(event) => onShowBoundsChange(event.target.checked)}
					/>
					Show boundaries
				</label>
			</section>

			<section>
				<h3 className={sectionHeadingClass}>Config</h3>
				<pre className="m-0 wrap-anywhere whitespace-pre-wrap text-[0.7rem]">
					{JSON.stringify({ palettes, circles }, null, 2)}
				</pre>
				<div className="mt-2 flex flex-wrap gap-2">
					<button
						className={controlButtonClass}
						type="button"
						onClick={() =>
							onCopy(JSON.stringify({ palettes, circles }, null, 2))
						}
						aria-live="polite"
					>
						{copyState === "copied"
							? "Copied"
							: copyState === "failed"
								? "Copy failed"
								: "Copy config"}
					</button>
					<button className={controlButtonClass} type="button" onClick={reset}>
						Reset
					</button>
				</div>
			</section>
		</>
	);
}

function SoundTools({
	playing,
	settings,
	onToggle,
	onUpdate,
}: {
	playing: boolean;
	settings: AudioSettings;
	onToggle: () => void;
	onUpdate: (key: keyof AudioSettings, value: number) => void;
}) {
	return (
		<>
			<button className={controlButtonClass} type="button" onClick={onToggle}>
				{playing ? "Pause ambience" : "Play ambience"}
			</button>

			{AUDIO_KEYS.map((key) => (
				<Slider
					key={key}
					label={key}
					value={settings[key]}
					min={0}
					max={1}
					step={0.01}
					onChange={(value) => onUpdate(key, value)}
				/>
			))}
		</>
	);
}

export default function Playground({
	terrainState,
	terrainDispatch,
	sunPalettes,
	onSunPalettesChange,
	sunCircles,
	onSunCirclesChange,
	showSunBounds,
	onShowSunBoundsChange,
	audioPlaying,
	audioSettings,
	onAudioToggle,
	onAudioUpdate,
	onClose,
	className,
}: {
	terrainState: TerrainState;
	terrainDispatch: Dispatch<TerrainAction>;
	sunPalettes: SunPalettes;
	onSunPalettesChange: (palettes: SunPalettes) => void;
	sunCircles: SunCircles;
	onSunCirclesChange: (circles: SunCircles) => void;
	showSunBounds: boolean;
	onShowSunBoundsChange: (show: boolean) => void;
	audioPlaying: boolean;
	audioSettings: AudioSettings;
	onAudioToggle: () => void;
	onAudioUpdate: (key: keyof AudioSettings, value: number) => void;
	onClose: () => void;
	className?: string;
}) {
	const [tab, setTab] = useState<PlaygroundTab>("landscape");
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
		"idle",
	);

	async function copyConfig(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			setCopyState("copied");
		} catch {
			setCopyState("failed");
		}
	}

	return (
		<aside
			className={`flex min-h-0 flex-col bg-background px-4 py-3 text-xs ${className ?? ""}`}
			aria-label="Desert playground"
		>
			<div className="flex shrink-0 items-center justify-between gap-2 pb-2">
				<strong>Desert playground</strong>
				<button
					className={controlButtonClass}
					type="button"
					onClick={onClose}
					title="Close playground"
				>
					Close
				</button>
			</div>

			<nav
				aria-label="Playground sections"
				className="flex shrink-0 flex-wrap gap-2 pb-3"
			>
				{TABS.map((item) => (
					<button
						key={item.key}
						className={`${controlButtonClass} aria-pressed:border-foreground`}
						type="button"
						aria-pressed={tab === item.key}
						onClick={() => setTab(item.key)}
					>
						{item.label}
					</button>
				))}
			</nav>

			<div className="min-h-0 flex-1 overflow-y-auto pb-2 [&>section+section]:mt-4">
				{tab === "landscape" && (
					<LandscapeTools state={terrainState} dispatch={terrainDispatch} />
				)}
				{tab === "sun" && (
					<SunTools
						palettes={sunPalettes}
						onPalettesChange={onSunPalettesChange}
						circles={sunCircles}
						onCirclesChange={onSunCirclesChange}
						showBounds={showSunBounds}
						onShowBoundsChange={onShowSunBoundsChange}
						copyState={copyState}
						onCopy={(text) => void copyConfig(text)}
					/>
				)}
				{tab === "sound" && (
					<SoundTools
						playing={audioPlaying}
						settings={audioSettings}
						onToggle={onAudioToggle}
						onUpdate={onAudioUpdate}
					/>
				)}
			</div>
		</aside>
	);
}
