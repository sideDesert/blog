const siteUrl = "https://sidedesert.github.io/blog/";
const shareImage = new URL("side-desert-landscape.jpg", siteUrl).href;
const shareImageAlt = "Stippled desert panorama with a sun, mesas, and saguaros";

export const siteDescription =
	"Notes on databases, systems, and software projects by Siddarth Saha.";

export function pageHead(
	path: string,
	title: string,
	description: string,
	type: "website" | "article" = "website",
) {
	const relativePath = path.replace(/^\//, "").replace(/\/?$/, "/");
	const url = new URL(path === "/" ? "." : relativePath, siteUrl).href;

	return {
		links: [{ rel: "canonical", href: url }],
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: "sideDesert" },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: url },
			{ property: "og:image", content: shareImage },
			{ property: "og:image:type", content: "image/jpeg" },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: shareImageAlt },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: shareImage },
			{ name: "twitter:image:alt", content: shareImageAlt },
		],
	};
}
