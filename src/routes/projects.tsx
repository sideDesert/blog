import { pageHead } from "#/lib/pageHead";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type TouchEvent, useRef, useState } from "react";
import bustubArt from "#/assets/projects/bustub.webp";
import rabbitholeArt from "#/assets/projects/rabbithole.webp";
import shibaArt from "#/assets/projects/shiba.webp";
import smallocArt from "#/assets/projects/smalloc.webp";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
import { Button } from "#/components/ui/button";
import { desertMain } from "#/components/ui/desert-layout";

export const Route = createFileRoute("/projects")({
	component: Projects,
	head: () =>
		pageHead(
			"/projects",
			"Projects | Siddarth Saha",
			"Explore projects by Siddarth Saha, including a database engine, a memory allocator, and a learning agent.",
		),
});

const projects = [
	{
		name: "Rabbithole",
		art: rabbitholeArt,
		height: 300,
		description:
			"A learning agent with branching conversations and scheduled reviews.",
		technology: "Python · EverMemOS",
		source: "https://github.com/sideDesert/rabbithole",
	},
	{
		name: "BusTub",
		art: bustubArt,
		height: 208,
		description: "Database internals I built while studying CMU 15-445.",
		technology: "C++ · Self-study",
	},
	{
		name: "Smalloc",
		art: smallocArt,
		height: 228,
		description: "A small memory allocator I wrote to learn C.",
		technology: "C · mmap",
		source: "https://github.com/sideDesert/smalloc",
	},
	{
		name: "Shiba Browser",
		art: shibaArt,
		height: 228,
		description:
			"A prototype for streaming a shared browser’s video and audio to multiple viewers.",
		technology: "Go · WebRTC · GStreamer",
		source: "https://github.com/sideDesert/shiba-browser",
	},
];

function ProjectDetails({ project }: { project: (typeof projects)[number] }) {
	return (
		<div>
			<h2 className="text-xl font-semibold leading-[1.2]">{project.name}</h2>
			<p className="mt-2 max-w-[40ch] text-sm">{project.description}</p>
			<p className="mt-2 text-sm text-muted-foreground">{project.technology}</p>
			{project.source && (
				<a
					href={project.source}
					aria-label={`View ${project.name} source`}
					className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground"
				>
					View source <span aria-hidden="true">↗</span>
				</a>
			)}
		</div>
	);
}

function Projects() {
	const [active, setActive] = useState(0);
	const swipeStart = useRef<{ x: number; y: number } | null>(null);

	function move(direction: -1 | 1) {
		if (window.matchMedia("(min-width: 80rem)").matches) return;
		const pageSize = window.matchMedia("(min-width: 40rem)").matches ? 2 : 1;
		setActive(
			(index) =>
				(Math.floor(index / pageSize) * pageSize +
					direction * pageSize +
					projects.length) %
				projects.length,
		);
	}

	function startSwipe(event: TouchEvent) {
		const touch = event.touches[0];
		swipeStart.current =
			event.touches.length === 1
				? { x: touch.clientX, y: touch.clientY }
				: null;
	}

	function finishSwipe(event: TouchEvent) {
		const start = swipeStart.current;
		swipeStart.current = null;
		if (!start) return;
		const touch = event.changedTouches[0];
		const horizontal = touch.clientX - start.x;
		const vertical = touch.clientY - start.y;
		if (
			Math.abs(horizontal) >= 42 &&
			Math.abs(horizontal) > 1.25 * Math.abs(vertical)
		) {
			move(horizontal < 0 ? 1 : -1);
		}
	}

	return (
		<main className={`${desertMain} viewport-page`}>
			<DesertPageIntro
				title="Projects"
				description="Things I’ve built to learn how software works."
				landscape={<WorkshopScene scene="projects" />}
			>
				<Link
					to="/workshop"
					className="mt-3 inline-block underline underline-offset-4"
				>
					Desert Workshop
				</Link>
			</DesertPageIntro>
			<div className="grid min-h-0 grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] min-[80rem]:grid-cols-1">
				<Button
					variant="ghost"
					className="size-14 self-center min-[80rem]:hidden"
					aria-label="Previous project"
					aria-controls="project-catalogue"
					onClick={() => move(-1)}
				>
					<ArrowLeft aria-hidden="true" className="size-6" />
				</Button>
				<ul
					id="project-catalogue"
					aria-label="Project catalogue"
					aria-live="polite"
					className="project-catalogue touch-pan-y touch-pinch-zoom"
					onTouchStart={startSwipe}
					onTouchEnd={finishSwipe}
					onTouchCancel={() => {
						swipeStart.current = null;
					}}
				>
					{projects.map((project, index) => (
						<li
							key={project.name}
								className={`min-h-[17rem] min-w-0 content-start gap-3 bg-background px-2 py-3 sm:px-5 min-[80rem]:grid ${index === active ? "grid" : "hidden"} ${Math.floor(index / 2) === Math.floor(active / 2) ? "sm:grid" : "sm:hidden"}`}
						>
							<img
								src={project.art}
								alt=""
								width={610}
								height={project.height}
								className="aspect-[610/300] max-h-[5.5rem] w-full object-contain dark:invert"
							/>
							<ProjectDetails project={project} />
						</li>
					))}
				</ul>
				<Button
					variant="ghost"
					className="size-14 self-center min-[80rem]:hidden"
					aria-label="Next project"
					aria-controls="project-catalogue"
					onClick={() => move(1)}
				>
					<ArrowRight aria-hidden="true" className="size-6" />
				</Button>
			</div>
		</main>
	);
}
