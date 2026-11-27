import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
import { PostCover } from "#/components/ui/PostCover";
import { desertMain } from "#/components/ui/desert-layout";
import { posts } from "#/lib/posts";

export const Route = createFileRoute("/posts/")({
	component: Posts,
	head: () => ({ meta: [{ title: "Blog | Siddarth Saha" }] }),
});

function Posts() {
	return (
		<main className={desertMain}>
			<DesertPageIntro
				title="Blog"
				description="Notes on databases, systems, and what I’m learning."
				landscape={<WorkshopScene scene="blog" />}
			/>
			{posts.length === 0 ? (
				<p className="mt-6 text-muted-foreground">Writing in progress.</p>
			) : (
				<ul className="grid w-full max-w-[44rem] auto-rows-fr gap-4 py-4 sm:grid-cols-2">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								className="group block h-full overflow-hidden border border-border"
								to="/posts/$slug"
								params={{ slug: post.slug }}
							>
								<PostCover
									cover={post.cover}
									coverLight={post.coverLight}
									className="aspect-2/1 w-full border-b border-border object-cover"
									loading="lazy"
								/>
								<div className="px-4 py-3">
									<h2 className="text-lg font-semibold group-hover:underline">
										{post.title}
									</h2>
									{post.summary && (
										<p className="mt-2 text-sm text-muted-foreground">
											{post.summary}
										</p>
									)}
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
