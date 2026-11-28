import { createHash } from "node:crypto";
import { readFileSync, readdirSync, realpathSync } from "node:fs";
import {
	dirname,
	extname,
	isAbsolute,
	relative,
	resolve,
	sep,
} from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Plugin, ResolvedConfig } from "vite";
import { parse } from "yaml";
import type { Post } from "./post";

const catalogId = "\0virtual:posts";
const bodiesId = "\0virtual:post-bodies";
const imageExtension = /^\.(avif|gif|jpe?g|png|svg|webp)$/i;

type Note = {
	file: string;
	slug: string;
	title: string;
	draft: boolean;
	summary?: string;
	cover?: string;
	coverLight?: string;
	markdown: string;
};

type MarkdownNode = {
	type: string;
	tagName?: string;
	value?: string;
	children?: MarkdownNode[];
	properties?: Record<string, unknown>;
};

function slugFor(text: string) {
	return text
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Number}]+/gu, "-")
		.replace(/^-|-$/g, "");
}

function stringProperty(properties: unknown, key: string) {
	if (
		!properties ||
		typeof properties !== "object" ||
		!Object.hasOwn(properties, key)
	)
		return;
	const value: unknown = Reflect.get(properties, key);
	return typeof value === "string" ? value : undefined;
}

function readNote(
	file: string,
	filename: string,
	previewDrafts: boolean,
): Note | undefined {
	const source = readFileSync(file, "utf8");
	const frontmatter = /^\uFEFF?---\r?\n([\s\S]*?)^---[\t ]*(?:\r?\n|$)/m.exec(
		source,
	);
	if (frontmatter?.index !== 0) return;

	const properties: unknown = parse(frontmatter[1]);
	if (!properties) return;
	const draft =
		typeof properties === "object" &&
		Object.hasOwn(properties, "draft") &&
		Reflect.get(properties, "draft") === true;
	if (draft && !previewDrafts) return;

	const title = stringProperty(properties, "title");
	if (!title?.trim())
		throw new Error(`Expected a title in the frontmatter of ${file}`);

	return {
		file,
		slug: slugFor(filename.slice(0, -3)),
		title,
		draft,
		summary: stringProperty(properties, "summary"),
		cover: stringProperty(properties, "cover"),
		coverLight: stringProperty(properties, "coverLight"),
		markdown: source.slice(frontmatter[0].length),
	};
}

function inside(directory: string, file: string) {
	const path = relative(directory, file);
	return (
		path !== "" &&
		path !== ".." &&
		!path.startsWith(`..${sep}`) &&
		!isAbsolute(path)
	);
}

function resolveNoteLink(note: Note, href: string) {
	if (/^(?:[a-z][\w+.-]*:|\/)/i.test(href)) return;

	try {
		const [, path, query, fragment] =
			/^([^?#]*)(\?[^#]*)?(?:#(.*))?$/.exec(href) ?? [];
		if (path === undefined) return;
		return {
			file: path
				? resolve(dirname(note.file), decodeURIComponent(path))
				: note.file,
			query: query ?? "",
			fragment: fragment === undefined ? "" : decodeURIComponent(fragment),
		};
	} catch {
		return;
	}
}

function textContent(node: MarkdownNode): string {
	return node.value ?? node.children?.map(textContent).join("") ?? "";
}

function compileBody(
	note: Note,
	resolveLink: (href: string) => string | undefined,
	resolveImage: (src: string) => string | undefined,
) {
	function rewriteMarkdown() {
		return (tree: MarkdownNode) => {
			const used = new Set<string>();

			function visit(node: MarkdownNode) {
				const properties = node.properties;
				if (properties && node.tagName) {
					if (/^h[1-6]$/.test(node.tagName)) {
						const base = slugFor(textContent(node)) || "section";
						let id = base;
						for (let count = 2; used.has(id); count++) id = `${base}-${count}`;
						properties.id = id;
						used.add(id);
					} else if (
						node.tagName === "a" &&
						typeof properties.href === "string"
					) {
						const href = resolveLink(properties.href);
						if (href === undefined) delete properties.href;
						else properties.href = href;
					} else if (
						node.tagName === "img" &&
						typeof properties.src === "string"
					) {
						properties.src = resolveImage(properties.src) ?? properties.src;
						properties.loading = "lazy";
					}
				}

				node.children?.forEach(visit);
			}

			visit(tree);
		};
	}

	return renderToStaticMarkup(
		createElement(
			Markdown,
			{
				skipHtml: true,
				remarkPlugins: [remarkGfm],
				rehypePlugins: [rewriteMarkdown],
			},
			note.markdown,
		),
	);
}

export function postSource(): Plugin {
	let config: ResolvedConfig;
	let directory: string;

	return {
		name: "post-source",
		configResolved(resolved) {
			config = resolved;
			directory = resolve(config.root, "src/content/posts");
		},
		resolveId(source) {
			if (source === "virtual:posts") return catalogId;
			if (source === "virtual:post-bodies") return bodiesId;
		},
		hotUpdate({ file, modules, timestamp }) {
			if (!inside(directory, file)) return;
			const { moduleGraph, name, hot } = this.environment;
			const affected = new Set(modules);
			for (const id of [catalogId, bodiesId]) {
				const module = moduleGraph.getModuleById(id);
				if (module) affected.add(module);
			}

			if (name === "client") return [...affected];

			// Restart SSR before the browser refreshes with the updated catalog.
			const invalidated = new Set<
				NonNullable<ReturnType<typeof moduleGraph.getModuleById>>
			>();
			for (const module of affected)
				moduleGraph.invalidateModule(module, invalidated, timestamp, true);
			hot.send({ type: "full-reload", path: "*" });
			return [];
		},
		load(id) {
			if (id !== catalogId && id !== bodiesId) return;
			const previewDrafts = config.command === "serve";
			const reloadOnEdit = previewDrafts
				? "\nif (import.meta.hot && !import.meta.env.SSR) import.meta.hot.accept(() => window.location.reload());"
				: "";
			const byFile = new Map<string, Note>();
			const usedSlugs = new Set<string>();
			for (const filename of readdirSync(directory).sort()) {
				if (!filename.endsWith(".md")) continue;
				const file = resolve(directory, filename);
				this.addWatchFile(file);
				const note = readNote(file, filename, previewDrafts);
				if (!note) continue;
				if (!note.slug || usedSlugs.has(note.slug)) {
					this.error(`Choose a unique post filename for ${file}`);
				}
				usedSlugs.add(note.slug);
				byFile.set(file, note);
			}

			const urls = new Map<string, string>();
			const resolveImage = (note: Note, href: string) => {
				const target = resolveNoteLink(note, href);
				if (!target || !inside(directory, target.file)) return;
				const extension = extname(target.file).toLowerCase();
				if (!imageExtension.test(extension)) return;

				let url = urls.get(target.file);
				if (!url) {
					let path: string;
					try {
						path = realpathSync(target.file);
					} catch {
						return;
					}
					if (!inside(directory, path)) return;
					this.addWatchFile(path);
					if (previewDrafts) {
						url =
							config.base +
							relative(config.root, path)
								.split(sep)
								.map(encodeURIComponent)
								.join("/");
					} else {
						const source = readFileSync(path);
						const hash = createHash("sha256")
							.update(source)
							.digest("hex")
							.slice(0, 20);
						const fileName = `assets/posts/${hash}${extension}`;
						this.emitFile({ type: "asset", fileName, source });
						url = config.base + fileName;
					}
					urls.set(target.file, url);
				}
				return (
					url +
					target.query +
					(target.fragment ? `#${encodeURIComponent(target.fragment)}` : "")
				);
			};

			if (id === bodiesId) {
				const bodies = [...byFile.values()].map((note) => [
					note.slug,
					compileBody(
						note,
						(href) => {
							const target = resolveNoteLink(note, href);
							if (!target) return href;
							const fragment = slugFor(target.fragment);
							const hash = fragment ? `#${encodeURIComponent(fragment)}` : "";
							if (href.startsWith("#")) return hash || href;

							const linked = byFile.get(target.file);
							if (linked)
								return `${config.base}posts/${encodeURIComponent(linked.slug)}${target.query}${hash}`;
							if (
								inside(directory, target.file) &&
								extname(target.file).toLowerCase() === ".md"
							)
								return;
							return resolveImage(note, href) ?? href;
						},
						(src) => resolveImage(note, src),
					),
				]);
				return `export const postBodies = Object.fromEntries(${JSON.stringify(bodies)});${reloadOnEdit}`;
			}

			function coverFor(note: Note, href: string | undefined) {
				if (!href) return;
				const url = resolveImage(note, href);
				if (!url && !note.draft)
					throw new Error(`Could not find cover ${href} for ${note.file}`);
				return url;
			}

			const posts: Omit<Post, "html">[] = [...byFile.values()].map((note) => ({
				slug: note.slug,
				title: note.title,
				summary: note.summary,
				cover: coverFor(note, note.cover),
				coverLight: coverFor(note, note.coverLight),
			}));
			return `export const posts = ${JSON.stringify(posts)};${reloadOnEdit}`;
		},
	};
}
