import { type CSSProperties, useEffect, useId, useState } from "react";

type Trajectory = { id: number; x: number; y: number; dx: number; dy: number };

export function ShootingStar() {
	const [trajectory, setTrajectory] = useState<Trajectory>();
	const gradient = useId();

	useEffect(() => {
		let timer: number;
		let id = 0;

		function schedule() {
			timer = window.setTimeout(
				() => {
					const direction = Math.random() < 0.5 ? -1 : 1;
					const [left, right] = Math.random() < 0.65 ? [11, 54] : [69, 96];
					const distance = 11 + Math.random() * 9;
					const start = left + distance * (direction === 1 ? 0.32 : 1);
					setTrajectory({
						id: id++,
						x: start + Math.random() * (right - left - distance * 1.32),
						y: 4 + Math.random() * 5,
						dx: direction * distance,
						dy: 4 + Math.random() * 2,
					});
					schedule();
				},
				4000 + Math.random() * 1000,
			);
		}

		schedule();
		return () => window.clearTimeout(timer);
	}, []);

	if (!trajectory) return null;
	const { id, x, y, dx, dy } = trajectory;

	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 100 50"
			preserveAspectRatio="none"
		>
			<defs>
				<linearGradient
					id={gradient}
					gradientUnits="userSpaceOnUse"
					x1={x - dx * 0.32}
					y1={y - dy * 0.32}
					x2={x}
					y2={y}
				>
					<stop stopColor="currentColor" stopOpacity={0} />
					<stop offset={1} stopColor="currentColor" />
				</linearGradient>
			</defs>
			<g
				key={id}
				className="workshop-shooting-star"
				style={
					{ "--flight-x": `${dx}px`, "--flight-y": `${dy}px` } as CSSProperties
				}
			>
				<line
					x1={x - dx * 0.32}
					y1={y - dy * 0.32}
					x2={x}
					y2={y}
					stroke={`url(#${gradient})`}
					strokeWidth={0.13}
				/>
				<circle cx={x} cy={y} r={0.15} fill="currentColor" />
			</g>
		</svg>
	);
}
