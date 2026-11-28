// Give the browser a rendering opportunity between the still frame and motion.
export function afterDesertPaint(start: () => void) {
	let frame = requestAnimationFrame(() => {
		frame = requestAnimationFrame(start);
	});
	return () => cancelAnimationFrame(frame);
}
