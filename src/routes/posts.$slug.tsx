import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { PostCover } from "#/components/ui/PostCover";
import { pageHead, siteDescription } from "#/lib/pageHead";
import { posts } from "virtual:posts";
import "./post.css";

export const Route = createFileRoute("/posts/$slug")({
	loader: async ({ params }) => {
		const post = posts.find(({ slug }) => slug === params.slug);

		if (!post) {
			throw notFound();
		}

		const { postBodies } = await import("virtual:post-bodies");
		const html = postBodies[post.slug];
		if (html === undefined) throw notFound();
		return { ...post, html };
	},
	head: ({ loaderData }) =>
		loaderData
			? pageHead(
					`/posts/${encodeURIComponent(loaderData.slug)}`,
					`${loaderData.title} | Siddarth Saha`,
					loaderData.summary || siteDescription,
					"article",
				)
			: {},
	component: Post,
});

function Post() {
	const post = Route.useLoaderData();

	return (
		<main className="mx-auto w-full max-w-4xl px-5 pt-4 pb-10 sm:px-8 sm:pt-7 sm:pb-14">
			<article>
				<header>
					<Button asChild variant="ghost" size="sm" className="-ml-3">
						<Link to="/posts">← Blog</Link>
					</Button>
					<h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
						{post.title}
					</h1>
					{post.summary && (
						<p className="mt-4 text-muted-foreground">{post.summary}</p>
					)}
					<PostCover
						cover={post.cover}
						coverLight={post.coverLight}
						className="mt-6 aspect-2/1 w-full max-w-xl border border-border object-cover"
					/>
				</header>
				<div
					className="post-body mt-8"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: The compiler escapes content and skips raw HTML.
					dangerouslySetInnerHTML={{ __html: post.html }}
				/>
			</article>
		</main>
	);
}
