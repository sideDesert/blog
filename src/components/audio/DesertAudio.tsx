import { AudioLines, AudioLinesOff, Volume1, Volume2 } from "lucide-react";
import { useDesertAudioContext } from "#/components/audio/DesertAudioContext";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

export function DesertAudio() {
  const { playing, toggle, settings, update } = useDesertAudioContext();

  return (
    <div className="group relative inline-flex self-start flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause desert audio" : "Play desert audio"}
      >
        {playing ? <AudioLines /> : <AudioLinesOff />}
      </Button>
      {playing && (
        <div className="absolute inset-x-0 top-full z-10 hidden pt-1 group-hover:block group-focus-within:block">
          <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-background py-2 shadow-sm">
            <Volume2
              className="size-3 text-muted-foreground"
              aria-hidden="true"
            />
            <Slider
              orientation="vertical"
              min={0}
              max={0.1}
              step={0.01}
              value={[settings.volume]}
              onValueChange={([volume]) => update("volume", volume)}
              className="cursor-pointer data-[orientation=vertical]:h-20 data-[orientation=vertical]:min-h-20 data-[orientation=vertical]:w-4"
              aria-label="Desert audio volume"
            />
            <Volume1
              className="size-3 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}
