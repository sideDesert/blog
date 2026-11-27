import { pageHead, siteDescription } from "#/lib/pageHead";
import {
  desertAside,
  desertMain,
  desertRow,
} from "#/components/ui/desert-layout";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";
import Landscape from "#/components/ascii-art/Landscape";
import { DEFAULT_CIRCLES } from "#/components/ascii-art/Sun";
import { DEFAULT_SUN_PALETTES } from "#/components/ascii-art/sun/palette";
import {
  createInitialState,
  terrainReducer,
} from "#/components/ascii-art/terrain/state";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
import { useDesertAudioContext } from "#/components/audio/DesertAudioContext";
import Playground from "#/components/playground/Playground";
import {
  readShowSunBounds,
  readSunCircles,
  readSunPalettes,
  readTerrainConfig,
  writeShowSunBounds,
  writeSunCircles,
  writeSunPalettes,
  writeTerrainConfig,
} from "#/lib/playgroundStorage";

import { posts } from "#/lib/posts";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => pageHead("/", "sideDesert | Siddarth Saha", siteDescription),
});

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

function LatestPosts() {
  return (
    <section className="py-4" aria-labelledby="latest-posts">
      <h2
        id="latest-posts"
        className="mt-2 mb-4 text-[1.25rem] font-semibold leading-[1.2]"
      >
        Blog
      </h2>
      {posts.length > 0 ? (
        <ul className="mr-6">
          {posts.slice(0, 2).map((post) => (
            <li key={post.slug}>
              <Link
                className="block p-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                to="/posts/$slug"
                params={{ slug: post.slug }}
              >
                <span aria-hidden="true">&gt;</span> {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Writing in progress.</p>
      )}
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
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [desertQuote, setDesertQuote] = useState(desertQuotes[0]!);
  const audio = useDesertAudioContext();

  useEffect(() => {
    setDesertQuote(pickDesertQuote());

    const config = readTerrainConfig();
    if (config) terrainDispatch({ type: "loadConfig", config });
    setSunPalettes(readSunPalettes());
    setSunCircles(readSunCircles());
    setShowSunBounds(readShowSunBounds());
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (storageLoaded) writeTerrainConfig(terrainState.config);
  }, [terrainState.config, storageLoaded]);

  useEffect(() => {
    if (storageLoaded) writeSunPalettes(sunPalettes);
  }, [sunPalettes, storageLoaded]);

  useEffect(() => {
    if (storageLoaded) writeSunCircles(sunCircles);
  }, [sunCircles, storageLoaded]);

  useEffect(() => {
    if (storageLoaded) writeShowSunBounds(showSunBounds);
  }, [showSunBounds, storageLoaded]);

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

  return (
    <main className={`${desertMain} relative`}>
      <DesertPageIntro
        title="sideDesert"
        description="A quiet corner on the internet. Notes, ideas, code and curiosity from the side of the desert."
        landscape={landscape}
        asideInert={playgroundOpen}
      >
        <blockquote className="mt-3.5 italic">
          “Wide horizons, deeper thoughts.”
        </blockquote>
      </DesertPageIntro>

      <div className={`${desertRow} flex-1`}>
        <LatestPosts />
        <button
          type="button"
          onClick={() => setDesertQuote(pickDesertQuote())}
          className={`${desertAside} flex w-full max-w-64 cursor-pointer items-start justify-start pt-2 pb-5 text-left min-[56rem]:max-w-none min-[56rem]:self-stretch min-[56rem]:pt-[1.625rem]`}
          aria-label="Show another desert quote"
          inert={playgroundOpen}
        >
          <span className="block min-[56rem]:max-w-[20ch]">{desertQuote}</span>
        </button>
      </div>
      {playgroundOpen && (
        <div className={`${desertRow} pointer-events-none contents min-[56rem]:absolute min-[56rem]:inset-0 min-[56rem]:z-30 min-[56rem]:grid-rows-[minmax(0,1fr)]`}>
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
            className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 h-[min(45svh,26rem)] border-t border-(--rule) min-[56rem]:static min-[56rem]:col-start-2 min-[56rem]:h-full min-[56rem]:border-t-0 min-[56rem]:border-l"
          />
        </div>
      )}
    </main>
  );
}
