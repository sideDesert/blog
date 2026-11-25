import fan from "./grass/fan.svg";
import leaning from "./grass/leaning.svg";
import open from "./grass/open.svg";
import sparse from "./grass/sparse.svg";
import spreading from "./grass/spreading.svg";

const grassArt = { fan, leaning, open, sparse, spreading };

export default function Grass({
	variant,
	color,
}: {
	variant: keyof typeof grassArt;
	color: boolean;
}) {
	const filter = color
		? "[filter:sepia(1)_saturate(2.6)_hue-rotate(65deg)_brightness(var(--grass-brightness,0.5))] [--grass-brightness:0.5] dark:[--grass-brightness:0.8]"
		: "brightness-0 dark:brightness-100";

	return <img className={`block h-auto w-full dark:opacity-60 ${filter}`} src={grassArt[variant]} alt="" />;
}
