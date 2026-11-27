type PostSource = {
	title: string;
	draft: boolean;
	summary?: string;
	cover?: string;
	coverLight?: string;
	body: string;
};

type Post = PostSource & {
	slug: string;
	file: string;
};

const postSources = import.meta.glob<PostSource | null>(
	"../content/posts/*.md",
	{ eager: true, import: "default", query: "?post" },
);

const images = import.meta.glob<string>(
	"../content/posts/**/*.{avif,gif,jpeg,jpg,png,svg,webp}",
	{ eager: true, import: "default", query: "?url" },
);

const vaultUrl = new URL("https://vault.invalid/");

function resolveVaultLink(file: string, href: string) {
	if (/^(?:[a-z][\w+.-]*:|\/)/i.test(href)) {
		return;
	}

	try {
		const url = new URL(href, new URL(file, vaultUrl));
		return {
			file: `../content/posts${decodeURIComponent(url.pathname)}`,
			hash: decodeURIComponent(url.hash.slice(1)),
		};
	} catch {
		return;
	}
}

export function postImage(file: string, source: string) {
	const target = resolveVaultLink(file, source);
	return target && images[target.file];
}

export function markdownSlug(text: string) {
	return text
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Number}]+/gu, "-")
		.replace(/^-|-$/g, "");
}

const postsBySlug = new Map<string, Post>();
const postsByFile = new Map<string, Post>();

for (const [path, source] of Object.entries(postSources)) {
	if (!source) {
		continue;
	}

	const file = path.slice("../content/posts/".length);
	const slug = markdownSlug(file.slice(0, -".md".length));

	if (!slug || postsBySlug.has(slug)) {
		throw new Error(`Choose a unique post filename for ${path}`);
	}

	const cover = source.cover && postImage(file, source.cover);
	const coverLight = source.coverLight && postImage(file, source.coverLight);

	if (!source.draft) {
		const missingCover =
			(source.cover && !cover && source.cover) ||
			(source.coverLight && !coverLight && source.coverLight);
		if (missingCover) {
			throw new Error(`Could not find cover ${missingCover} for ${path}`);
		}
	}

	const post = {
		...source,
		slug,
		file,
		cover: cover || undefined,
		coverLight: coverLight || undefined,
	};
	postsBySlug.set(slug, post);
	postsByFile.set(path, post);
}

export const posts = [...postsBySlug.values()];

export function getPost(slug: string) {
	return postsBySlug.get(slug);
}

export function getLinkedPost(file: string, href: string) {
	const target = resolveVaultLink(file, href);
	const post = target && postsByFile.get(target.file);

	return post && { post, hash: target.hash };
}
