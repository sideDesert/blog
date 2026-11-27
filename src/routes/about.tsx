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
		<main className={`${desertMain} about-page`}>
			<DesertPageIntro
				title="About"
				description="My name is Siddarth. I'm a software engineer at ServiceNow and a graduate of IIT Hyderabad, where I studied Civil Engineering."
				landscape={<WorkshopScene scene="about" />}
			>
				<div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
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
			</DesertPageIntro>

			<div
				className="about-copy grid content-start gap-6 py-5 text-[0.925rem] leading-relaxed min-[56rem]:grid-cols-3 min-[64rem]:gap-8"
				aria-label="About Siddarth"
				role="region"
				tabIndex={0}
			>
				<section className="max-w-[60ch]">
					<h2 className="mb-2 text-base font-semibold">How I got here</h2>
					<p>
						Somewhere along the way, I fell in love with computer science and
						have been trying to understand the machine ever since. I'm
						fascinated by the layers of abstraction that make modern computing
						possible.
					</p>
				</section>
				<section className="max-w-[60ch]">
					<h2 className="mb-2 text-base font-semibold">What I’m learning</h2>
					<p>
						Outside work, I've been studying operating systems, implementing
						database internals, and exploring distributed systems. I love
						building things from scratch and questioning abstractions.
					</p>
				</section>
				<section className="max-w-[60ch]">
					<h2 className="mb-2 text-base font-semibold">What I work on</h2>
					<p>
						At ServiceNow, my recent work has involved AI agent harnesses,
						virtual machines, sandboxed execution, and network isolation. I'm
						interested in systems engineering and working with people who care
						about building software.
					</p>
				</section>
			</div>
		</main>
	);
}
