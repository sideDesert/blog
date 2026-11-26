import { createFileRoute, Link } from "@tanstack/react-router";
import bustubArt from "#/assets/projects/bustub.svg";
import rabbitholeArt from "#/assets/projects/rabbithole.svg";
import shibaArt from "#/assets/projects/shiba.svg";
import smallocArt from "#/assets/projects/smalloc.svg";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
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
			<p className="mt-3 max-w-[40ch]">{project.description}</p>
			<p className="mt-3 text-sm text-muted-foreground">{project.technology}</p>
			{project.source && (
				<a
					href={project.source}
					aria-label={`View ${project.name} source`}
					className="mt-3 inline-block underline underline-offset-4 hover:text-muted-foreground"
				>
					View source <span aria-hidden="true">↗</span>
				</a>
			)}
		</div>
	);
}

function Projects() {
	const [featured, ...otherProjects] = projects;

	return (
		<main className={desertMain}>
			<DesertPageIntro
				title="Projects"
				description="Things I’ve built to learn how software works."
				landscape={<WorkshopScene scene="projects" />}
				className="border-b border-(--rule) pb-4 min-[56rem]:pb-0"
			>
				<Link
					to="/workshop"
					className="mt-4 inline-block underline underline-offset-4"
				>
					Desert Workshop
				</Link>
			</DesertPageIntro>
			<section className="border-b border-(--rule)">
				<article className="grid items-center gap-5 py-7 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:gap-8">
					<img
						src={featured.art}
						alt=""
						width={610}
						height={featured.height}
						className="mx-auto w-full max-w-[48rem] dark:invert"
					/>
					<ProjectDetails project={featured} />
				</article>
			</section>

			<ul className="divide-y divide-(--rule) min-[56rem]:grid min-[56rem]:grid-cols-3 min-[56rem]:divide-x min-[56rem]:divide-y-0">
				{otherProjects.map((project) => (
					<li
						key={project.name}
						className="grid content-start gap-5 py-7 min-[56rem]:px-[clamp(1rem,2.25vw,2.5rem)] min-[56rem]:first:pl-0 min-[56rem]:last:pr-0"
					>
						<img
							src={project.art}
							alt=""
							width={610}
							height={project.height}
							className="aspect-[610/228] w-full object-contain dark:invert"
						/>
						<ProjectDetails project={project} />
					</li>
				))}
			</ul>
		</main>
	);
}
