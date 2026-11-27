import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "#/components/ui/button";
import { PostCover } from "#/components/ui/PostCover";
import { getLinkedPost, getPost, markdownSlug, postImage } from "#/lib/posts";
import "./post.css";

type MarkdownNode = {
	type: string;
	tagName?: string;
	value?: string;
	children?: MarkdownNode[];
	properties?: Record<string, unknown>;
};

function headingText(node: MarkdownNode): string {
	return node.value ?? node.children?.map(headingText).join("") ?? "";
}

function markdownHeadings() {
	return (tree: MarkdownNode) => {
		const used = new Set<string>();

		function visit(node: MarkdownNode) {
			if (node.tagName && /^h[1-6]$/.test(node.tagName) && node.properties) {
				const base = markdownSlug(headingText(node)) || "section";
				let id = base;

				for (let count = 2; used.has(id); count++) {
					id = `${base}-${count}`;
				}

				node.properties.id ??= id;
				used.add(id);
			}

			node.children?.forEach(visit);
		}

		visit(tree);
	};
}

export const Route = createFileRoute("/posts/$slug")({
	loader: ({ params }) => {
		const post = getPost(params.slug);

		if (!post) {
			throw notFound();
		}

		return post;
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [
					{ title: `${loaderData.title} | Siddarth Saha` },
					...(loaderData.summary
						? [{ name: "description", content: loaderData.summary }]
						: []),
				]
			: [],
	}),
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
				<div className="post-body mt-8">
					<Markdown
						skipHtml
						remarkPlugins={[remarkGfm]}
						rehypePlugins={[markdownHeadings]}
						components={{
							a({ node: _node, href, children, ...props }) {
								const linked = href && getLinkedPost(post.file, href);

								if (linked) {
									return (
										<Link
											to="/posts/$slug"
											params={{ slug: linked.post.slug }}
											hash={markdownSlug(linked.hash) || undefined}
										>
											{children}
										</Link>
									);
								}

								return (
									<a
										{...props}
										href={(href && postImage(post.file, href)) || href}
									>
										{children}
									</a>
								);
							},
							img({ node: _node, src, alt, ...props }) {
								const image =
									typeof src === "string"
										? postImage(post.file, src)
										: undefined;

								return (
									<img
										{...props}
										alt={alt ?? ""}
										loading="lazy"
										src={image ?? src}
									/>
								);
							},
						}}
					>
						{post.body}
					</Markdown>
				</div>
			</article>
		</main>
	);
}
