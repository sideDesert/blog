import { Moon, Sun } from "lucide-react";
import { useAppearance } from "#/lib/appearance";
import { Button } from "./ui/button";

export default function ThemeToggle() {
	const { mode, theme, toggleTheme } = useAppearance();
	const nextTheme = theme === "dark" ? "light" : "dark";

	const label = `Theme: ${mode === "auto" ? `auto (${theme})` : mode}. Switch to ${nextTheme} mode.`;

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label={label}
			title={label}
			className="size-11 text-foreground"
		>
			{theme === "dark" ? (
				<Moon aria-hidden="true" className="size-[26px]" strokeWidth={1.5} />
			) : (
				<Sun aria-hidden="true" className="size-[26px]" strokeWidth={1.5} />
			)}
		</Button>
	);
}
