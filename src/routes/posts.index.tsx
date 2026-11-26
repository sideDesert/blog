import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkshopScene } from "#/components/ascii-art/workshop/WorkshopScene";
import { DesertPageIntro } from "#/components/ui/DesertPageIntro";
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
				className="border-b border-(--rule) pb-4 min-[56rem]:pb-0"
			/>
			{posts.length === 0 ? (
				<p className="mt-6 text-muted-foreground">Writing in progress.</p>
			) : (
				<ul className="mt-8 grid gap-6 sm:grid-cols-2">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								className="group block h-full overflow-hidden border border-border"
								to="/posts/$slug"
								params={{ slug: post.slug }}
							>
								{post.cover && (
									<img
										alt=""
										className="aspect-2/1 w-full border-b border-border object-cover"
										loading="lazy"
										src={post.cover}
									/>
								)}
								<div className="p-5">
									<h2 className="text-lg font-semibold group-hover:underline">
										{post.title}
										{post.draft && (
											<span className="ml-2 text-xs text-muted-foreground">
												Draft
											</span>
										)}
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
