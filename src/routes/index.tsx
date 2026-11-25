import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";
import Landscape from "#/components/ascii-art/Landscape";
import { DEFAULT_CIRCLES } from "#/components/ascii-art/Sun";
import { DEFAULT_SUN_PALETTES } from "#/components/ascii-art/sun/palette";
import {
  createInitialState,
  terrainReducer,
} from "#/components/ascii-art/terrain/state";
import { DesertAudio } from "#/components/audio/DesertAudio";
import { useDesertAudioContext } from "#/components/audio/DesertAudioContext";
import Playground from "#/components/playground/Playground";

export const Route = createFileRoute("/")({ component: Home });

const latestPosts = [
  "Finding stillness in all the Noise",
  "Building a little shitty malloc",
];

const desertQuotes = [
  "The desert teaches patience. Mostly because nothing happens.",
  "The grass is greener where there is grass.",
  "Even a cactus has boundaries.",
  "The desert is minimalist out of necessity, not taste.",
  "Bloom where you're planted. Lower your expectations accordingly.",
  "The sun is a little too supportive here.",
  "Every cloud has a silver lining. Finding a cloud is the problem.",
  "The desert offers clarity and mild dehydration.",
  "Stay grounded. There is sand everywhere anyway.",
  "A cactus is just a cucumber with trust issues.",
  "Sometimes the journey matters more than the destination. Especially when you're lost.",
  "The desert has excellent work-life balance. Nothing works.",
  "Nature heals. Occasionally, it also burns.",
  "Less is more, except when it comes to water.",
  "The desert teaches humility. SPF 50 helps.",
  "Not all who wander are lost. Some are looking for shade.",
  "The cactus thrives on neglect. An admirable quality.",
  "The horizon looks closer than it is. Classic.",
  "Every oasis begins with suspicious optimism.",
  "Life finds a way. Comfort, apparently, does not.",
  "The desert has no distractions. Just increasingly concerning thoughts.",
  "Even the tumbleweed has somewhere to be.",
  "The desert is proof that doing nothing can be beautiful.",
  "Seek inner peace. And preferably air conditioning.",
  "The cactus grew a personality instead of leaves.",
  "The desert is an acquired thirst.",
  "Some things take time. Rain takes liberties.",
  "Sand gets everywhere. Enlightenment is less reliable.",
  "The desert makes you appreciate the little things. Like plumbing.",
  "Growth is uncomfortable. Ask any cactus.",
  "The desert is nature's open floor plan.",
  "The best things in life are free. Shade is surprisingly competitive.",
  "A mirage is optimism with poor infrastructure.",
  "The desert doesn't judge. It just watches you make questionable decisions.",
  "Sometimes you need space. Several thousand square kilometres, apparently.",
  "The cactus is emotionally unavailable but environmentally responsible.",
  "The desert has seasons. Hot and personal attack.",
  "Follow your dreams, but bring water.",
  "The sand is warm. So is everything else.",
  "The desert is a wonderful place to reflect on your packing choices.",
  "Even in the desert, problems have a way of piling up.",
  "The cactus never asks for much. Be like the cactus.",
  "Silence is golden. Shade is priceless.",
  "The desert has mastered the art of not overdecorating.",
  "A little rain would be character development.",
  "The desert encourages you to live in the moment. The next one might be hotter.",
  "Happiness is a state of mind. Dehydration is not.",
  "The cactus has survived millions of years without a productivity app.",
  "The desert is peaceful until you remember you're in it.",
  "Everything happens for a reason. Except the sand in your shoes.",
];

function pickDesertQuote() {
  return desertQuotes[Math.floor(Math.random() * desertQuotes.length)]!;
}

const homeRow =
  "min-[56rem]:grid min-[56rem]:grid-cols-[minmax(0,4fr)_minmax(14rem,1.03fr)] min-[56rem]:items-stretch";

const homeAside =
  "after:mt-[1.375rem] min-[56rem]:border-l min-[56rem]:border-[var(--rule)] min-[56rem]:pl-[clamp(1rem,2.25vw,2.5rem)]";

const mainClass =
  "mx-auto flex w-[min(100rem,calc(100%-2*clamp(1rem,4.35vw,5rem)))] flex-col text-[0.9375rem] leading-[1.4]";

function LatestPosts({ className }: { className: string }) {
  return (
    <section
      className={`min-h-60 py-6 ${className}`}
      aria-labelledby="latest-posts"
    >
      <h2
        id="latest-posts"
        className="mt-2 mb-4 text-[1.25rem] font-semibold leading-[1.2]"
      >
        Latest Posts
      </h2>
      <ul className="mr-6">
        {latestPosts.map((title) => (
          <li
            key={title}
            className="hover:bg-accent cursor-pointer hover:text-accent-foreground dark:hover:bg-accent/50 p-3"
          >
            <span aria-hidden="true">&gt;</span> {title}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Home() {
  const [terrainState, terrainDispatch] = useReducer(
    terrainReducer,
    undefined,
    createInitialState,
  );
  const [sunPalettes, setSunPalettes] = useState(DEFAULT_SUN_PALETTES);
  const [sunCircles, setSunCircles] = useState(DEFAULT_CIRCLES);
  const [showSunBounds, setShowSunBounds] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [desertQuote, setDesertQuote] = useState(desertQuotes[0]!);
  const audio = useDesertAudioContext();

  useEffect(() => {
    setDesertQuote(pickDesertQuote());
  }, []);

  const landscape = (
    <Landscape
      terrainState={terrainState}
      terrainDispatch={terrainDispatch}
      sunPalettes={sunPalettes}
      sunCircles={sunCircles}
      showSunBounds={showSunBounds}
      onCactusClick={() => setPlaygroundOpen((current) => !current)}
    />
  );

  if (playgroundOpen) {
    return (
      <main className={mainClass}>
        <div
          className={`${homeRow} flex-1 min-[56rem]:grid-rows-[minmax(clamp(0px,calc(100svh-19rem),min(34rem,36vw)),auto)_auto]`}
        >
          {landscape}
          <Playground
            terrainState={terrainState}
            terrainDispatch={terrainDispatch}
            sunPalettes={sunPalettes}
            onSunPalettesChange={setSunPalettes}
            sunCircles={sunCircles}
            onSunCirclesChange={setSunCircles}
            showSunBounds={showSunBounds}
            onShowSunBoundsChange={setShowSunBounds}
            audioPlaying={audio.playing}
            audioSettings={audio.settings}
            onAudioToggle={audio.toggle}
            onAudioUpdate={audio.update}
            onClose={() => setPlaygroundOpen(false)}
            className="max-sm:max-h-[70svh] min-[56rem]:sticky min-[56rem]:top-4 min-[56rem]:col-start-2 min-[56rem]:row-span-2 min-[56rem]:row-start-1 min-[56rem]:h-[calc(100svh-8rem)] min-[56rem]:max-h-[44rem]"
          />
          <LatestPosts className="min-[56rem]:col-start-1 min-[56rem]:row-start-2 py-4" />
        </div>
      </main>
    );
  }

  return (
    <main className={mainClass}>
      <div className={`${homeRow} flex-1`}>
        {landscape}
        <section
          className={`${homeAside} min-[56rem]:self-stretch min-[56rem]:my-[1.125rem_0.25rem min-[56rem]:py-[1.125rem_0.375rem]`}
          aria-labelledby="home-title"
        >
          <div className="flex justify-between">
            <div>
              <h1
                id="home-title"
                className="text-[1.625rem] font-semibold leading-[1.2] after:mt-2 after:w-11"
              >
                sideDesert
              </h1>
            </div>
            <DesertAudio />
          </div>
          <p className="mt-5 text-[0.925rem]">
            A quiet corner on the internet. Notes, ideas, code and curiosity
            from the side of the desert.
          </p>
          <blockquote className="mt-3.5 italic">
            “Wide horizons, deeper thoughts.”
          </blockquote>
        </section>
      </div>

      <div className={`${homeRow} border-t border-(--rule)`}>
        <LatestPosts className="min-[56rem]:-mt-1  min-[56rem]:min-h-[clamp(10rem,calc(100svh-22.5rem),18rem)] py-4" />
        <button
          type="button"
          onClick={() => setDesertQuote(pickDesertQuote())}
          className={`${homeAside} mt-4 flex w-full max-w-64 cursor-pointer items-start justify-start text-left min-[56rem]:mt-0 min-[56rem]:max-w-none min-[56rem]:min-h-[9.625rem] min-[56rem]:self-stretch min-[56rem]:pt-[1.625rem]`}
          aria-label="Show another desert quote"
        >
          <span className="block min-[56rem]:max-w-[20ch]">{desertQuote}</span>
        </button>
      </div>
    </main>
  );
}
