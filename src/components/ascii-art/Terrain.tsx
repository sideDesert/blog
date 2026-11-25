import { type Dispatch, useId, useMemo } from "react";
import { TerrainCanvas } from "./terrain/Canvas";
import { createScene } from "./terrain/geometry";
import type { TerrainAction, TerrainState } from "./terrain/state";

export default function Terrain({
	state,
	dispatch,
	color = false,
}: {
	state: TerrainState;
	dispatch: Dispatch<TerrainAction>;
	color?: boolean;
}) {
	const clipId = useId();
	const scene = useMemo(
		() => createScene(state.config, state.render),
		[state.config, state.render],
	);

	return (
		<TerrainCanvas
			clipId={clipId}
			color={color}
			canvasClassName="absolute inset-0 block h-full w-full"
			config={state.config}
			selectedId={state.selectedId}
			view={state.view}
			dither={state.render.dither}
			drawingSeams={state.drawingSeams}
			scene={scene}
			onDraw={(seam) => dispatch({ type: "addDrawnSeam", seam })}
		/>
	);
}
