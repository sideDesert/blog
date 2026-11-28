import { type Dispatch, useMemo } from "react";
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
	const scene = useMemo(
		() => createScene(state.config, state.render),
		[state.config, state.render],
	);

	return (
		<TerrainCanvas
			color={color}
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
