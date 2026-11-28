declare module "virtual:posts" {
	export const posts: readonly Omit<import("./post").Post, "html">[];
}

declare module "virtual:post-bodies" {
	export const postBodies: Readonly<Record<string, string | undefined>>;
}
