import { useEffect, useState } from "react";

const colorStorageKey = "color";

export function useDesertColor() {
	const [colorEnabled, setColorEnabled] = useState(false);

	useEffect(() => {
		try {
			setColorEnabled(window.localStorage.getItem(colorStorageKey) === "on");
		} catch {
			// The toggle still works when storage is unavailable.
		}
	}, []);

	function toggleColor() {
		const enabled = !colorEnabled;
		setColorEnabled(enabled);
		try {
			window.localStorage.setItem(colorStorageKey, enabled ? "on" : "off");
		} catch {
			// The in-memory setting remains active.
		}
	}

	return { colorEnabled, toggleColor };
}
