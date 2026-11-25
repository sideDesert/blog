import { useEffect, useRef, useState } from "react";

export type AudioSettings = {
  wind: number;
  sand: number;
  gusts: number;
  volume: number;
};

const DEFAULT_SETTINGS: AudioSettings = {
  wind: 0.65,
  sand: 0.2,
  gusts: 0.35,
  volume: 0.03,
};

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

function createEngine() {
  const ctx = new AudioContext();
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

  return { ctx, master, wind, sand, gusts };
}

export function useDesertAudio() {
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [running, setRunning] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const playing = enabled && running;

  function toggle() {
    setEnabled(!playing);
    if (!playing) {
      void engine.current?.ctx.resume().catch(() => {});
    }
  }

  useEffect(() => {
    if (typeof AudioContext === "undefined") return;

    const audio = createEngine();
    engine.current = audio;
    const { ctx } = audio;

    function resume() {
      void ctx.resume().catch(() => {});
    }

    function syncRunning() {
      const isRunning = ctx.state === "running";
      setRunning(isRunning);
      if (isRunning) window.removeEventListener("click", resume);
    }

    ctx.addEventListener("statechange", syncRunning);
    window.addEventListener("click", resume);
    syncRunning();
    if (ctx.state !== "running") resume();

    return () => {
      window.removeEventListener("click", resume);
      ctx.removeEventListener("statechange", syncRunning);
      void ctx.close();
      engine.current = null;
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

  function update(key: keyof AudioSettings, value: number) {
    setSettings((previous) => ({
      ...previous,
      [key]: Math.max(0, Math.min(1, value)),
    }));
  }

  return { playing, settings, toggle, update };
}
