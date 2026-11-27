import fan from "./grass/fan.svg";
import leaning from "./grass/leaning.svg";
import open from "./grass/open.svg";
import sparse from "./grass/sparse.svg";
import spreading from "./grass/spreading.svg";

const grassArt = {
	fan: [fan, "196/92"],
	leaning: [leaning, "121/51"],
	open: [open, "101/54"],
	sparse: [sparse, "96/44"],
	spreading: [spreading, "179/103"],
};

export default function Grass({
	variant,
	color,
	windDelay,
}: {
	variant: keyof typeof grassArt;
	color: boolean;
	windDelay?: number;
}) {
	const [src, aspectRatio] = grassArt[variant];

	return (
		<span
			aria-hidden="true"
			className={`block w-full dark:opacity-60 ${windDelay === undefined ? "" : "desert-grass-sway"}`}
			style={{
				aspectRatio,
				backgroundColor: color
					? "var(--desert-grass)"
					: "var(--desert-grass-neutral)",
				mask: `url("${src}") center / 100% 100% no-repeat`,
				animationDelay: windDelay === undefined ? undefined : `${windDelay}s`,
			}}
		/>
	);
}
