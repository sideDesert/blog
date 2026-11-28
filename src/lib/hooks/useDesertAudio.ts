import { useCallback, useEffect, useRef, useState } from "react";
import {
	createMoonChime,
	playSandClick,
} from "#/components/audio/desertVoices";
import {
	DEFAULT_AUDIO_SETTINGS,
	type AudioSettings,
	readStudioSave,
	updateStudioSave,
} from "#/lib/studioStorage";

function createNoise(ctx: AudioContext, type: "brown" | "pink") {
	const buffer = ctx.createBuffer(1, ctx.sampleRate * 12, ctx.sampleRate);

	const data = buffer.getChannelData(0);

	let last = 0;
	let p = 0;
	let q = 0;
	let r = 0;

	for (let i = 0; i < data.length; i++) {
		const white = Math.random() * 2 - 1;

		if (type === "brown") {
			last = (last + 0.025 * white) / 1.025;
			data[i] = last * 5;
		} else {
			p = 0.997 * p + 0.055 * white;
			q = 0.96 * q + 0.12 * white;
			r = 0.57 * r + 0.27 * white;

			data[i] = (p + q + r + white * 0.15) * 0.6;
		}
	}

	const source = ctx.createBufferSource();

	source.buffer = buffer;
	source.loop = true;

	return source;
}

function createLayer(
	ctx: AudioContext,
	destination: AudioNode,
	noise: "brown" | "pink",
	filterType: BiquadFilterType,
	frequency: number,
) {
	const source = createNoise(ctx, noise);
	const filter = ctx.createBiquadFilter();
	const gain = ctx.createGain();

	filter.type = filterType;
	filter.frequency.value = frequency;
	filter.Q.value = 0.5;

	gain.gain.value = 0;

	source.connect(filter);
	filter.connect(gain);
	gain.connect(destination);

	source.start();

	return gain;
}

function createEngine(ctx: AudioContext) {
	const master = ctx.createGain();

	master.gain.value = 0;
	master.connect(ctx.destination);

	const wind = createLayer(ctx, master, "brown", "lowpass", 650);

	const sand = createLayer(ctx, master, "pink", "bandpass", 2400);

	// Slowly modulate the intensity of the gusts.
	const modulation = ctx.createGain();
	modulation.gain.value = 0.65;
	modulation.connect(master);

	const gusts = createLayer(ctx, modulation, "brown", "lowpass", 380);

	const oscillator = ctx.createOscillator();
	const depth = ctx.createGain();

	oscillator.type = "sine";
	oscillator.frequency.value = 0.083;
	depth.gain.value = 0.35;

	oscillator.connect(depth);
	depth.connect(modulation.gain);

	oscillator.start();

	return { ctx, master, wind, sand, gusts, moonChime: createMoonChime(ctx) };
}

export function useDesertAudio() {
	const engine = useRef<ReturnType<typeof createEngine> | null>(null);
	const pendingResume = useRef<Promise<void> | null>(null);

	const [enabled, setEnabled] = useState(true);
	const [running, setRunning] = useState(false);
	const [settings, setSettings] = useState<AudioSettings>(
		DEFAULT_AUDIO_SETTINGS,
	);
	const lastSaved = useRef<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
	const [settingsLoaded, setSettingsLoaded] = useState(false);
	const playing = enabled && running;

	function toggle() {
		setEnabled(!playing);
	}

	const playNavigationClick = useCallback(() => {
		const audio = engine.current;
		if (!audio) return;
		if (audio.ctx.state === "running") {
			playSandClick(audio.ctx);
		} else {
			void pendingResume.current?.then(() => {
				if (engine.current === audio && audio.ctx.state === "running") {
					playSandClick(audio.ctx);
				}
			});
		}
	}, []);

	const playMoonChime = useCallback((strength: number) => {
		const audio = engine.current;
		if (audio?.ctx.state === "running") audio.moonChime(strength);
	}, []);

	useEffect(() => {
		if (typeof AudioContext === "undefined") return;

		function syncRunning() {
			setRunning(engine.current?.ctx.state === "running");
		}

		function activate(event: Event) {
			if (!event.isTrusted || navigator.userActivation?.isActive === false)
				return;

			if (!engine.current) {
				let ctx: AudioContext | undefined;
				try {
					ctx = new AudioContext();
					engine.current = createEngine(ctx);
					ctx.addEventListener("statechange", syncRunning);
				} catch {
					void ctx?.close().catch(() => {});
					return;
				}
			}

			const { ctx } = engine.current;
			if (ctx.state === "running") {
				syncRunning();
			} else if (!pendingResume.current) {
				pendingResume.current = ctx
					.resume()
					.catch(() => {})
					.finally(() => {
						if (engine.current?.ctx !== ctx) return;
						pendingResume.current = null;
						syncRunning();
					});
			}
		}

		// Capture the gesture before a navigation or control handler plays a sound.
		document.addEventListener("click", activate, true);
		document.addEventListener("keydown", activate, true);

		return () => {
			document.removeEventListener("click", activate, true);
			document.removeEventListener("keydown", activate, true);
			const audio = engine.current;
			engine.current = null;
			pendingResume.current = null;
			if (audio) {
				audio.ctx.removeEventListener("statechange", syncRunning);
				void audio.ctx.close().catch(() => {});
			}
		};
	}, []);

	useEffect(() => {
		const audio = engine.current;
		if (!audio) return;

		const t = audio.ctx.currentTime;

		audio.wind.gain.setTargetAtTime(settings.wind * 0.7, t, 0.2);

		audio.sand.gain.setTargetAtTime(settings.sand * 0.16, t, 0.2);

		audio.gusts.gain.setTargetAtTime(settings.gusts * 0.24, t, 0.2);

		audio.master.gain.setTargetAtTime(playing ? settings.volume : 0, t, 0.15);
	}, [settings, playing]);

	useEffect(() => {
		const restored = readStudioSave().audio ?? DEFAULT_AUDIO_SETTINGS;
		lastSaved.current = restored;
		setSettings(restored);
		setSettingsLoaded(true);
	}, []);

	useEffect(() => {
		if (!settingsLoaded || lastSaved.current === settings) return;
		updateStudioSave({ audio: settings });
		lastSaved.current = settings;
	}, [settings, settingsLoaded]);

	function update(key: keyof AudioSettings, value: number) {
		setSettings((previous) => ({
			...previous,
			[key]: Math.max(0, Math.min(1, value)),
		}));
	}

	return {
		playing,
		settings,
		toggle,
		update,
		playNavigationClick,
		playMoonChime,
	};
}
