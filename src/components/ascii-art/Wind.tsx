import type { CSSProperties } from "react";

const gusts = [
	{ top: 34, left: -22, width: 42, opacity: 0.26, duration: 7.4, delay: -1.2 },
	{ top: 51, left: -34, width: 58, opacity: 0.34, duration: 6.1, delay: -4.6 },
	{ top: 68, left: -18, width: 36, opacity: 0.22, duration: 8.2, delay: -2.9 },
	{ top: 81, left: -40, width: 64, opacity: 0.3, duration: 5.7, delay: -0.7 },
] as const;

export default function Wind({
	color,
	distant,
}: {
	color: boolean;
	distant: boolean;
}) {
	const filter = color
		? "[filter:sepia(0.75)_saturate(1.9)_hue-rotate(-8deg)]"
		: "brightness-0 dark:brightness-100";

	return (
		<div
			aria-hidden="true"
			className={`pointer-events-none absolute inset-0 ${filter} ${distant ? "[--wind-scale:0.7]" : ""}`}
		>
			{gusts.map((gust) => (
				<span
					key={gust.top}
					className="wind-gust"
					style={
						{
							top: `${gust.top}%`,
							left: `${gust.left}%`,
							width: `${gust.width}%`,
							"--wind-opacity": gust.opacity,
							"--wind-duration": `${gust.duration}s`,
							"--wind-delay": `${gust.delay}s`,
						} as CSSProperties
					}
				/>
			))}
		</div>
	);
}
