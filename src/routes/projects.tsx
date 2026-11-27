import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import bustubArt from "#/assets/projects/bustub.svg";
import rabbitholeArt from "#/assets/projects/rabbithole.svg";
import shibaArt from "#/assets/projects/shiba.svg";
import smallocArt from "#/assets/projects/smalloc.svg";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
import { Button } from "#/components/ui/button";
import { desertMain } from "#/components/ui/desert-layout";

export const Route = createFileRoute("/projects")({
	component: Projects,
	head: () => ({ meta: [{ title: "Projects | Siddarth Saha" }] }),
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

	function move(direction: number) {
		const pageSize = window.matchMedia("(min-width: 40rem)").matches ? 2 : 1;
		setActive(
			(index) =>
				(Math.floor(index / pageSize) * pageSize +
					direction * pageSize +
					projects.length) %
				projects.length,
		);
	}

	return (
		<main className={`${desertMain} viewport-page`}>
			<DesertPageIntro
				title="Projects"
				description="Things I’ve built to learn how software works."
				landscape={<WorkshopScene scene="projects" />}
			>
				<div className="mt-3 flex items-center justify-between gap-3">
					<Link to="/workshop" className="underline underline-offset-4">
						Desert Workshop
					</Link>
					<div className="flex gap-2 min-[80rem]:hidden">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Previous project"
							aria-controls="project-catalogue"
							onClick={() => move(-1)}
						>
							←
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Next project"
							aria-controls="project-catalogue"
							onClick={() => move(1)}
						>
							→
						</Button>
					</div>
				</div>
			</DesertPageIntro>
			<ul
				id="project-catalogue"
				aria-label="Project catalogue"
				aria-live="polite"
				className="project-catalogue"
			>
				{projects.map((project, index) => (
					<li
						key={project.name}
						className={`min-h-[17rem] min-w-0 content-start gap-3 bg-background px-4 py-3 sm:px-5 min-[80rem]:grid ${index === active ? "grid" : "hidden"} ${Math.floor(index / 2) === Math.floor(active / 2) ? "sm:grid" : "sm:hidden"}`}
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
		</main>
	);
}
