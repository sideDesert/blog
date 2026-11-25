import type { Dispatch } from "react";
import { evaluateShape, samples } from "./geometry";
import {
	createShape,
	noiseControls,
	type Operation,
	type RenderSettings,
	shapeControls,
	shapePresets,
	type TerrainConfig,
	type ViewSettings,
} from "./model";
import type { TerrainAction } from "./state";

type ActionDispatch = Dispatch<TerrainAction>;

export const controlButtonClass =
	"cursor-pointer rounded-none border border-border bg-surface px-2 py-1 font-[inherit] text-xs text-foreground";
export const sidebarClass =
	"min-h-0 overflow-y-auto border-l border-border bg-background px-4 py-3 text-xs [&>section+section]:mt-4 max-sm:border-l-0 max-sm:border-t max-sm:border-border";
export const sectionHeadingClass =
	"text-[0.69rem] font-bold tracking-[0.16em] text-muted-foreground uppercase [margin:0_0_0.5rem]";

export function Slider({
	label,
	value,
	min = 0,
	max,
	step = 0.1,
	onChange,
}: {
	label: string;
	value: number;
	min?: number;
	max: number;
	step?: number;
	onChange: (value: number) => void;
}) {
	return (
		<label className="mb-2 block">
			<div className="flex justify-between gap-2">
				<span>{label}</span>
				<span>{value.toFixed(2)}</span>
			</div>

			<input
				className="block w-full"
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</label>
	);
}

function Checkbox({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
			{label}
		</label>
	);
}

export function Toolbar({
	drawingSeams,
	hasDrawnSeams,
	dispatch,
	onReferenceFile,
	onExport,
	onImportFile,
}: {
	drawingSeams: boolean;
	hasDrawnSeams: boolean;
	dispatch: ActionDispatch;
	onReferenceFile: (file: File) => void;
	onExport: () => void;
	onImportFile: (file: File) => void;
}) {
	return (
		<header className="flex shrink-0 items-center justify-between gap-4 [padding-block:0.5rem]">
			<strong>Terrain</strong>

			<div className="flex flex-wrap gap-2">
				<button
					className={`${controlButtonClass} aria-pressed:border-foreground`}
					type="button"
					aria-pressed={drawingSeams}
					onClick={() => dispatch({ type: "toggleSeamDrawing" })}
				>
					Draw seam
				</button>
				{hasDrawnSeams && (
					<>
						<button
							className={controlButtonClass}
							type="button"
							onClick={() => dispatch({ type: "flipLastSeam" })}
						>
							Flip shadow
						</button>
						<button
							className={controlButtonClass}
							type="button"
							onClick={() => dispatch({ type: "undoSeam" })}
						>
							Undo seam
						</button>
					</>
				)}
				<label className={`${controlButtonClass} inline-flex items-center`}>
					Reference image
					<input
						hidden
						type="file"
						accept="image/*"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) onReferenceFile(file);
						}}
					/>
				</label>

				<button className={controlButtonClass} type="button" onClick={onExport}>
					Export
				</button>

				<label className={`${controlButtonClass} inline-flex items-center`}>
					Import
					<input
						hidden
						type="file"
						accept=".json"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void onImportFile(file);
							event.target.value = "";
						}}
					/>
				</label>

				<button
					className={controlButtonClass}
					type="button"
					onClick={() => dispatch({ type: "reset" })}
				>
					Reset
				</button>
			</div>
		</header>
	);
}

export function PreviewControls({
	view,
	dither,
	dispatch,
}: {
	view: ViewSettings;
	dither: boolean;
	dispatch: ActionDispatch;
}) {
	return (
		<footer className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 [padding-block:0.5rem] text-xs">
			<Checkbox
				label="Reference"
				checked={view.showReference}
				onChange={(value) =>
					dispatch({ type: "setView", key: "showReference", value })
				}
			/>
			<Checkbox
				label="Shapes"
				checked={view.showShapes}
				onChange={(value) =>
					dispatch({ type: "setView", key: "showShapes", value })
				}
			/>
			<Checkbox
				label="Base terrain"
				checked={view.showBase}
				onChange={(value) =>
					dispatch({ type: "setView", key: "showBase", value })
				}
			/>
			<Checkbox
				label="Guides"
				checked={view.showGuides}
				onChange={(value) =>
					dispatch({ type: "setView", key: "showGuides", value })
				}
			/>
			<Checkbox
				label="Seams"
				checked={view.showSeams}
				onChange={(value) =>
					dispatch({ type: "setView", key: "showSeams", value })
				}
			/>
			<Checkbox
				label="Shaded dots"
				checked={dither}
				onChange={(value) =>
					dispatch({ type: "setRender", key: "dither", value })
				}
			/>
		</footer>
	);
}

export function Sidebar({
	config,
	selectedId,
	render,
	dispatch,
	className = sidebarClass,
}: {
	config: TerrainConfig;
	selectedId: string;
	render: RenderSettings;
	dispatch: ActionDispatch;
	className?: string;
}) {
	const selected = config.shapes.find((shape) => shape.id === selectedId);

	return (
		<aside className={className}>
			<section>
				<h3 className={sectionHeadingClass}>Add shape</h3>

				<div className="grid grid-cols-2 gap-1">
					{Object.entries(shapePresets).map(([name, preset]) => (
						<button
							key={name}
							className={controlButtonClass}
							type="button"
							onClick={() =>
								dispatch({ type: "addShape", shape: createShape(preset) })
							}
						>
							+ {name}
						</button>
					))}
				</div>
			</section>

			<section>
				<h3 className={sectionHeadingClass}>Layers ({config.shapes.length})</h3>

				<div className="grid gap-1">
					{config.shapes.map((shape, index) => (
						<button
							key={shape.id}
							type="button"
							className={`${controlButtonClass} flex items-center justify-between gap-2 text-left ${
								shape.id === selectedId ? "border-foreground" : ""
							}`}
							onClick={() => dispatch({ type: "selectShape", id: shape.id })}
						>
							<span>
								{index + 1}. {shape.name}
							</span>

							<small>{shape.operation}</small>
						</button>
					))}
				</div>

				{selected && (
					<div className="flex flex-wrap gap-2">
						<button
							className={controlButtonClass}
							type="button"
							onClick={() => dispatch({ type: "moveShape", direction: -1 })}
						>
							↑
						</button>

						<button
							className={controlButtonClass}
							type="button"
							onClick={() => dispatch({ type: "moveShape", direction: 1 })}
						>
							↓
						</button>

						<button
							className={controlButtonClass}
							type="button"
							onClick={() =>
								dispatch({
									type: "duplicateShape",
									shape: createShape({
										...selected,
										name: `${selected.name} copy`,
									}),
								})
							}
						>
							Duplicate
						</button>

						<button
							className={controlButtonClass}
							type="button"
							onClick={() => dispatch({ type: "deleteShape" })}
						>
							Delete
						</button>
					</div>
				)}
			</section>

			{selected && (
				<section>
					<h3 className={sectionHeadingClass}>Shape properties</h3>

					<input
						className={`${controlButtonClass} mb-2 block w-full`}
						value={selected.name}
						onChange={(event) =>
							dispatch({
								type: "updateShape",
								patch: { name: event.target.value },
							})
						}
					/>

					<select
						className={`${controlButtonClass} mb-2 block w-full`}
						value={selected.operation}
						onChange={(event) =>
							dispatch({
								type: "updateShape",
								patch: { operation: event.target.value as Operation },
							})
						}
					>
						<option value="max">Union (max)</option>
						<option value="add">Add</option>
						<option value="subtract">Subtract</option>
					</select>

					<svg
						role="img"
						aria-label="Selected shape preview"
						className="mb-2 block h-20 w-full"
						viewBox="0 0 100 110"
					>
						<line
							x1={0}
							x2={100}
							y1={105}
							y2={105}
							stroke="#555"
							strokeWidth={0.3}
						/>

						<polyline
							points={samples
								.map((x) => `${x},${105 - evaluateShape(x, selected)}`)
								.join(" ")}
							stroke="#f59e0b"
							strokeWidth={0.6}
							fill="none"
						/>
					</svg>

					{shapeControls.map((control) => (
						<Slider
							key={control.key}
							label={control.label}
							value={selected[control.key]}
							min={control.min}
							max={control.max}
							step={control.step}
							onChange={(value) =>
								dispatch({
									type: "updateShape",
									patch: { [control.key]: value },
								})
							}
						/>
					))}
				</section>
			)}

			<section>
				<h3 className={sectionHeadingClass}>Global irregularities</h3>

				{noiseControls.map((control) => (
					<Slider
						key={control.key}
						label={control.label}
						value={config.noise[control.key]}
						max={control.max}
						step={0.05}
						onChange={(value) =>
							dispatch({ type: "setNoise", key: control.key, value })
						}
					/>
				))}

				<button
					className={controlButtonClass}
					type="button"
					onClick={() => dispatch({ type: "disableIrregularities" })}
				>
					Disable irregularities
				</button>
			</section>

			<section>
				<h3 className={sectionHeadingClass}>Rendering</h3>

				<Slider
					label="Vertical scale"
					value={config.verticalScale}
					min={0.2}
					max={2}
					step={0.05}
					onChange={(value) => dispatch({ type: "setVerticalScale", value })}
				/>

				<Slider
					label="Grid spacing"
					value={render.gridSize}
					min={0.3}
					max={3}
					step={0.1}
					onChange={(value) =>
						dispatch({ type: "setRender", key: "gridSize", value })
					}
				/>

				<Slider
					label="Dot size"
					value={render.dotSize}
					min={0.1}
					max={1}
					step={0.05}
					onChange={(value) =>
						dispatch({ type: "setRender", key: "dotSize", value })
					}
				/>
			</section>
		</aside>
	);
}
