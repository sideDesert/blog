import { useEffect, useState } from "react";
import { afterDesertPaint } from "./afterDesertPaint";

export function useDesertMotion() {
	const [motion, setMotion] = useState(false);

	useEffect(() => {
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		let cancelStart: (() => void) | undefined;
		const sync = () => {
			cancelStart?.();
			if (preference.matches) setMotion(false);
			else cancelStart = afterDesertPaint(() => setMotion(true));
		};
		sync();
		preference.addEventListener("change", sync);
		return () => {
			cancelStart?.();
			preference.removeEventListener("change", sync);
		};
	}, []);

	return motion;
}
