const chroma = {
	wood: [29, -8, -3],
	fabric: [-29, 7, 15],
	metal: [-13, -1, 49],
	paper: [0, 1, -10],
	hemp: [-2, 4, -35],
	flame: [50, -14, -5],
} as const;

type Material = keyof typeof chroma;

export function materialInk(material: Material, source: string | number) {
	const tone =
		typeof source === "number"
			? source
			: [1, 3, 5].reduce(
					(sum, offset, index) =>
						sum +
						Number.parseInt(source.slice(offset, offset + 2), 16) *
							[0.21, 0.72, 0.07][index],
					0,
				);
	const channels = chroma[material].map((delta) =>
		Math.max(0, Math.min(255, Math.round(tone + delta))),
	);
	const alpha =
		typeof source === "string" && source.length === 9
			? Number.parseInt(source.slice(7), 16) / 255
			: 1;
	return `rgb(${channels.join(" ")} / ${alpha})`;
}

// The source hue identifies the material while luminance controls the dither.
export function materialAt(red: number, green: number, blue: number) {
	const warmth = red - green;
	const coolness = blue - green;
	if (coolness > 0 && (warmth > 47 || (red >= 250 && warmth > 20)))
		return "flame";
	if (warmth > 22 && coolness > 0) return "wood";
	if (coolness > 22 && warmth < 5) return "metal";
	if (warmth < -13 && coolness > 2) return "fabric";
	if (warmth < -2 && warmth > -13 && coolness < -24) return "hemp";
	if (Math.abs(warmth) <= 2 && coolness < -6 && coolness > -18) return "paper";
	if (warmth < -3 && coolness < -3) return "grass";
	return "sand";
}

export const woodInk = materialInk.bind(null, "wood");
export const fabricInk = materialInk.bind(null, "fabric");
export const metalInk = materialInk.bind(null, "metal");
export const paperInk = materialInk.bind(null, "paper");
export const hempInk = materialInk.bind(null, "hemp");
export const flameInk = materialInk.bind(null, "flame");
