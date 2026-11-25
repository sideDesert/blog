import { createContext, useContext } from "react";
import { useDesertAudio } from "#/lib/hooks/useDesertAudio";

type DesertAudioContextValue = ReturnType<typeof useDesertAudio>;

const DesertAudioContext = createContext<DesertAudioContextValue | null>(null);

export function DesertAudioProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const audio = useDesertAudio();

	return (
		<DesertAudioContext.Provider value={audio}>
			{children}
		</DesertAudioContext.Provider>
	);
}

export function useDesertAudioContext() {
	const value = useContext(DesertAudioContext);

	if (!value) {
		throw new Error(
			"useDesertAudioContext must be used within a DesertAudioProvider",
		);
	}

	return value;
}
