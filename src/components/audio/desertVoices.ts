export function playSandClick(ctx: AudioContext) {
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

	noise.connect(filter);
	filter.connect(noiseGain);
	noiseGain.connect(ctx.destination);

	oscillator.connect(toneGain);
	toneGain.connect(ctx.destination);

	noise.start(t);
	oscillator.start(t);
	oscillator.stop(t + duration);

	oscillator.onended = () => {
		noise.disconnect();
		filter.disconnect();
		noiseGain.disconnect();
		oscillator.disconnect();
		toneGain.disconnect();
	};
}

const NOTES = [659.25, 880, 987.77, 1174.66, 1318.51, 1567.98];

// Glass + silver harmonics
const PARTIALS = [
	[1, 1],
	[2.01, 0.26],
	[2.76, 0.15],
	[3.99, 0.0675],
	[5.43, 0.0225],
	[6.8, 0.006],
] as const;

export function createMoonChime(ctx: AudioContext) {
	const destination = ctx.createGain();
	destination.gain.value = 0;
	destination.connect(ctx.destination);
	let previousNote = -1;
	let lastStrike = -Infinity;

	return (strength: number) => {
		const t = ctx.currentTime;
		if (t - lastStrike < 0.25) return;
		lastStrike = t;
		destination.gain.setTargetAtTime(0.25, t, 0.08);

		previousNote =
			(previousNote + 1 + Math.floor(Math.random() * (NOTES.length - 1))) %
			NOTES.length;
		const decay = 2.92;
		// Small pitch variation for a natural sound.
		const frequency = NOTES[previousNote] * (0.998 + Math.random() * 0.004);

		PARTIALS.forEach(([ratio, amplitude], i) => {
			const oscillator = ctx.createOscillator();
			const gain = ctx.createGain();

			const duration = Math.max(0.1, decay / (1 + i * 0.6));
			const peak = Math.max(0.000001, 0.09 * strength * amplitude);

			oscillator.type = "sine";
			oscillator.frequency.value = frequency * ratio;

			gain.gain.setValueAtTime(0.000001, t);

			gain.gain.exponentialRampToValueAtTime(peak, t + 0.008 + i * 0.001);

			gain.gain.exponentialRampToValueAtTime(0.000001, t + duration);

			oscillator.connect(gain);
			gain.connect(destination);

			oscillator.start(t);
			oscillator.stop(t + duration);

			oscillator.onended = () => {
				oscillator.disconnect();
				gain.disconnect();
			};
		});
	};
}
