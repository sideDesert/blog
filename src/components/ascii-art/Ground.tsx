import Cactus from "./cactus";
import DesertTexture from "./DesertTexture";
import Grass from "./Grass";

// Depth runs from the horizon (0) to the foreground edge (100).
const plants = [
	{ kind: "grass", variant: "sparse", x: 34, depth: 52, width: 1.6 },
	{ kind: "grass", variant: "leaning", x: 44, depth: 66, width: 2.7 },
	{ kind: "grass", variant: "open", x: 80.5, depth: 71, width: 2.8 },
	{ kind: "grass", variant: "fan", x: 6.4, depth: 74, width: 4 },
	{ kind: "cactus", distant: true, x: 71.7, depth: 82, width: 3.7 },
	{ kind: "grass", variant: "sparse", x: 15.7, depth: 87, width: 2.5 },
	{ kind: "grass", variant: "leaning", x: 95.6, depth: 88, width: 3.1 },
	{ kind: "grass", variant: "spreading", x: 28.3, depth: 91, width: 5.2 },
	{ kind: "grass", variant: "fan", x: 61.1, depth: 96, width: 5.6 },
	{ kind: "cactus", distant: false, x: 22, depth: 97, width: 9.6 },
] as const;

const cactusClasses =
	"after:absolute after:inset-x-[29%] after:bottom-[-0.1em] after:h-[0.2em] after:rounded-full after:bg-[radial-gradient(ellipse,currentColor,transparent_70%)] after:opacity-[0.26] after:content-['']";
const cactusCanvasClass =
	"[transform:translateY(1.5%)_scaleX(var(--cactus-width-scale,0.74))]";

export default function Ground({
	color,
	onCactusClick,
}: {
	color: boolean;
	onCactusClick: () => void;
}) {
	return (
		<div className="absolute inset-x-0 bottom-0 h-[var(--ground-depth)]">
			<DesertTexture layer="ground" color={color} />
			{plants.map((plant) => (
				<div
					key={plant.x}
					className={[
						"absolute -translate-x-1/2 -translate-y-full",
						plant.kind === "cactus" ? cactusClasses : "",
						plant.kind === "cactus" && plant.distant
							? "[--cactus-width-scale:0.86]"
							: "",
					]
						.filter(Boolean)
						.join(" ")}
					data-distance={
						plant.kind === "cactus" && plant.distant ? "far" : undefined
					}
					style={{
						left: `${plant.x}%`,
						top: `${plant.depth}%`,
						width: `${plant.width}%`,
					}}
				>
					{plant.kind === "cactus" ? (
						<>
							<Cactus
								width="100%"
								darkGreen={color}
								far={plant.distant}
								className={cactusCanvasClass}
							/>
							{plant.distant && (
								<button
									type="button"
									className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground"
									onClick={onCactusClick}
									aria-label="Toggle the desert playground"
									title="Desert playground"
								/>
							)}
						</>
					) : (
						<Grass
							variant={plant.variant}
							color={color}
							windDelay={plant.x * -0.11}
						/>
					)}
				</div>
			))}
		</div>
	);
}
