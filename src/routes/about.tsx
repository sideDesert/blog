import { createFileRoute } from "@tanstack/react-router";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { GitHubLogo, LinkedInLogo, XLogo } from "#/components/SocialIcons";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
import { desertMain } from "#/components/ui/desert-layout";

const socialLinks = [
	{
		label: "GitHub",
		href: "https://github.com/sideDesert",
		logo: GitHubLogo,
	},
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/siddarth-saha-a02b64222/",
		logo: LinkedInLogo,
	},
	{
		label: "X",
		href: "https://x.com/siddarthsaha1",
		logo: XLogo,
	},
];

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<main className={`${desertMain} viewport-page`}>
			<DesertPageIntro
				title="About"
				description="My name is Siddarth. I'm a software engineer at ServiceNow and a graduate of IIT Hyderabad, where I studied Civil Engineering."
				landscape={<WorkshopScene scene="about" />}
			/>
			<section
				className="about-copy flex flex-col gap-4 py-5"
				aria-label="About Siddarth"
				tabIndex={0}
			>
				<p className="max-w-4xl text-[0.925rem]">
					Somewhere along the way, I fell in love with computer science and have
					been trying to understand the machine ever since. I'm fascinated by
					the layers of abstraction that make modern computing possible. Over
					the past year, I've spent much of my time outside work studying
					operating systems, implementing database internals, exploring
					distributed systems, and trying to understand what happens beneath the
					software we use every day. At ServiceNow, my recent work has involved
					AI agent harnesses, virtual machines, sandboxed execution, and network
					isolation. I love building things from scratch, questioning
					abstractions, and working with people who are genuinely passionate
					about engineering. I'm particularly interested in systems engineering
					and environments where I can learn aggressively, solve difficult
					problems, and build meaningful software.
				</p>

				<div className="flex flex-wrap gap-x-5 gap-y-2">
					{socialLinks.map(({ label, href, logo: Logo }) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noreferrer"
							aria-label={label}
							className="inline-flex items-center gap-1.5 hover:text-muted-foreground [&_svg]:size-4"
						>
							<Logo />
							<span className="underline underline-offset-4">{label}</span>
							<span aria-hidden="true">↗</span>
						</a>
					))}
				</div>
			</section>
		</main>
	);
}
