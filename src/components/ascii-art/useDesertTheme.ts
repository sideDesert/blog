import { useEffect, useState } from "react";
import type { SunTheme } from "./sun/palette";

export function useDesertTheme() {
	const [theme, setTheme] = useState<SunTheme>("light");
	useEffect(() => {
		const root = document.documentElement;
		const syncTheme = () =>
			setTheme(root.classList.contains("dark") ? "dark" : "light");
		const observer = new MutationObserver(syncTheme);
		syncTheme();
		observer.observe(root, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);
	return theme;
}
