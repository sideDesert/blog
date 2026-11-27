import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { parse } from "yaml";

function property(properties: unknown, key: string): unknown {
	if (
		properties &&
		typeof properties === "object" &&
		Object.hasOwn(properties, key)
	) {
		return Reflect.get(properties, key);
	}
}

export function postSource(): Plugin {
	let previewDrafts = false;

	return {
		name: "post-source",
		enforce: "pre",
		configResolved(config) {
			previewDrafts = config.command === "serve";
		},
		async load(id) {
			if (!id.endsWith(".md?post")) {
				return;
			}

			const path = id.slice(0, -"?post".length);
			this.addWatchFile(path);

			const source = await readFile(path, "utf8");
			const frontmatter =
				/^\uFEFF?---\r?\n([\s\S]*?)^---[\t ]*(?:\r?\n|$)/m.exec(source);
			const properties: unknown =
				frontmatter?.index === 0 ? parse(frontmatter[1]) : undefined;

			const draft = property(properties, "draft") === true;

			if (!properties || (draft && !previewDrafts)) {
				return "export default null";
			}

			const title = property(properties, "title");
			const cover = property(properties, "cover");
			const coverLight = property(properties, "coverLight");
			const summary = property(properties, "summary");

			if (typeof title !== "string" || !title.trim()) {
				this.error(`Expected a title in the frontmatter of ${path}`);
			}

			return `export default ${JSON.stringify({
				title,
				draft,
				cover: typeof cover === "string" ? cover : undefined,
				coverLight: typeof coverLight === "string" ? coverLight : undefined,
				summary: typeof summary === "string" ? summary : undefined,
				body: source.slice(frontmatter?.[0].length ?? 0),
			})}`;
		},
	};
}
