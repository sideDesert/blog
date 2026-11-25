import { useCallback, useEffect, useRef } from "react";

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

type Options = {
  enabled?: boolean;
  volume?: number;
  decay?: number;
  interval?: number;
  distance?: number;
};

export function useMoonChime({
  enabled = true,
  volume = 0.25,
  decay = 2.92,
  interval = 250,
  distance = 20,
}: Options = {}) {
  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const lastStrike = useRef(-Infinity);
  const previousNote = useRef(-1);
  const travel = useRef(0);

  const pointer = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  // Call from a user gesture to unlock browser audio.
  const unlock = useCallback(async () => {
    if (!audioRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();

      master.gain.value = 0;
      master.connect(ctx.destination);

      audioRef.current = ctx;
      masterRef.current = master;
    }

    await audioRef.current.resume();
  }, []);

  useEffect(() => {
    const ctx = audioRef.current;
    const master = masterRef.current;

    if (!ctx || !master) return;

    master.gain.setTargetAtTime(
      enabled ? Math.max(0, Math.min(1, volume)) : 0,
      ctx.currentTime,
      0.08,
    );
  }, [enabled, volume]);

  const strike = useCallback(
    (strength: number) => {
      const ctx = audioRef.current;
      const master = masterRef.current;

      if (!enabled || !ctx || !master || ctx.state !== "running") {
        return;
      }

      const t = ctx.currentTime;

      if (t - lastStrike.current < interval / 1000) {
        return;
      }

      lastStrike.current = t;

      master.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), t, 0.08);

      // Avoid playing the same note twice.
      const index =
        (previousNote.current +
          1 +
          Math.floor(Math.random() * (NOTES.length - 1))) %
        NOTES.length;

      previousNote.current = index;

      // Small pitch variation for a natural sound.
      const frequency = NOTES[index] * (0.998 + Math.random() * 0.004);

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
        gain.connect(master);

        oscillator.start(t);
        oscillator.stop(t + duration);

        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    },
    [enabled, volume, decay, interval],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const time = performance.now();

      const previous = pointer.current;

      if (!previous) {
        strike(0.22);
        pointer.current = { x, y, time };
        return;
      }

      const delta = Math.hypot(x - previous.x, y - previous.y);

      const elapsed = Math.max(8, time - previous.time);
      const speed = delta / elapsed;

      travel.current += delta;

      if (travel.current >= distance && speed > 0.025) {
        const strength = Math.min(0.85, 0.18 + speed * 0.65);

        strike(strength);
        travel.current = 0;
      }

      pointer.current = { x, y, time };
    },
    [strike, distance],
  );

  const onPointerLeave = useCallback(() => {
    pointer.current = null;
    travel.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();

      audioRef.current = null;
      masterRef.current = null;
      lastStrike.current = -Infinity;
    };
  }, []);

  return {
    unlock,
    strike,
    onPointerMove,
    onPointerLeave,
  };
}
