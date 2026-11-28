import { useSyncExternalStore } from "react";

export type ResolvedTheme = "light" | "dark";
type ThemeMode = ResolvedTheme | "auto";

type Appearance = {
	mode: ThemeMode;
	theme: ResolvedTheme;
	colorEnabled: boolean;
};

const serverAppearance: Appearance = {
	mode: "auto",
	theme: "light",
	colorEnabled: false,
};

// The head script runs this same factory before styles load. Keep it self-contained.
function createAppearance(browser: Window) {
	const media = browser.matchMedia("(prefers-color-scheme: dark)");
	const root = browser.document.documentElement;
	const listeners = new Set<() => void>();

	function read(key: string) {
		try {
			return browser.localStorage.getItem(key);
		} catch {
			return null;
		}
	}

	function write(key: string, value: string) {
		try {
			browser.localStorage.setItem(key, value);
		} catch {
			// Keep the new preference for this page if storage is unavailable.
		}
	}

	const savedTheme = read("theme");
	let mode: ThemeMode =
		savedTheme === "light" || savedTheme === "dark" ? savedTheme : "auto";
	let colorEnabled = read("color") === "on";

	function resolve(): Appearance {
		return {
			mode,
			theme: mode === "auto" ? (media.matches ? "dark" : "light") : mode,
			colorEnabled,
		};
	}

	function applyTheme({ mode, theme }: Appearance) {
		root.classList.toggle("light", theme === "light");
		root.classList.toggle("dark", theme === "dark");
		if (mode === "auto") root.removeAttribute("data-theme");
		else root.setAttribute("data-theme", mode);
		root.style.colorScheme = theme;
	}

	let snapshot = resolve();
	applyTheme(snapshot);

	function publish() {
		const next = resolve();
		if (next.mode !== snapshot.mode || next.theme !== snapshot.theme) {
			applyTheme(next);
		}
		snapshot = next;
		for (const listener of listeners) listener();
	}

	media.addEventListener("change", () => {
		if (mode === "auto") publish();
	});

	return {
		getSnapshot: () => snapshot,
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		toggleTheme() {
			mode = snapshot.theme === "dark" ? "light" : "dark";
			write("theme", mode);
			publish();
		},
		toggleColor() {
			colorEnabled = !colorEnabled;
			write("color", colorEnabled ? "on" : "off");
			publish();
		},
	};
}

declare global {
	interface Window {
		__desertAppearance?: ReturnType<typeof createAppearance>;
	}
}

export const appearanceInitScript = `window.__desertAppearance ||= (${createAppearance.toString()})(window);`;

function browserAppearance() {
	window.__desertAppearance ??= createAppearance(window);
	return window.__desertAppearance;
}

function subscribe(listener: () => void) {
	return browserAppearance().subscribe(listener);
}

function getSnapshot() {
	return browserAppearance().getSnapshot();
}

function getServerSnapshot() {
	return serverAppearance;
}

function toggleTheme() {
	browserAppearance().toggleTheme();
}

function toggleColor() {
	browserAppearance().toggleColor();
}

export function useAppearance() {
	const appearance = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	return { ...appearance, toggleTheme, toggleColor };
}
