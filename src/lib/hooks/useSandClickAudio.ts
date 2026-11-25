import { useCallback, useEffect, useRef } from "react";

export function useSandClickAudio(volume = 1) {
	const audioRef = useRef<AudioContext | null>(null);

	const play = useCallback(async () => {
		if (!audioRef.current) {
			audioRef.current = new AudioContext();
		}
		const ctx = audioRef.current;

		if (ctx.state === "suspended") {
			await ctx.resume();
		}

		const t = ctx.currentTime;
		const duration = 0.11;
		const attack = 0.012;

		// Soft sand texture
		const buffer = ctx.createBuffer(
			1,
			Math.ceil(ctx.sampleRate * duration),
			ctx.sampleRate,
		);

		const data = buffer.getChannelData(0);

		for (let i = 0; i < data.length; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		const noise = ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.value = 180;
		filter.Q.value = 0.65;

		const noiseGain = ctx.createGain();

		noiseGain.gain.setValueAtTime(0, t);
		noiseGain.gain.linearRampToValueAtTime(0.25, t + attack);
		noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

		// Soft, low-frequency thud
		const oscillator = ctx.createOscillator();
		oscillator.type = "sine";

		oscillator.frequency.setValueAtTime(110, t);
		oscillator.frequency.exponentialRampToValueAtTime(110 * 0.65, t + duration);

		const toneGain = ctx.createGain();

		toneGain.gain.setValueAtTime(0, t);
		toneGain.gain.linearRampToValueAtTime(0.09, t + attack);
		toneGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

		const master = ctx.createGain();
		master.gain.value = Math.max(0, Math.min(1, volume));

		noise.connect(filter);
		filter.connect(noiseGain);
		noiseGain.connect(master);

		oscillator.connect(toneGain);
		toneGain.connect(master);

		master.connect(ctx.destination);

		noise.start(t);
		oscillator.start(t);
		oscillator.stop(t + duration);

		oscillator.onended = () => {
			noise.disconnect();
			filter.disconnect();
			noiseGain.disconnect();
			oscillator.disconnect();
			toneGain.disconnect();
			master.disconnect();
		};
	}, [volume]);

	useEffect(() => {
		return () => {
			void audioRef.current?.close();
			audioRef.current = null;
		};
	}, []);

	return play;
}
