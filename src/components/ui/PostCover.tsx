export function PostCover({
	cover,
	coverLight,
	className,
	loading,
}: {
	cover?: string;
	coverLight?: string;
	className: string;
	loading?: "lazy";
}) {
	return (
		<>
			{(coverLight || cover) && (
				<img
					alt=""
					className={`${className} ${coverLight && cover ? "dark:hidden" : ""}`}
					loading={loading}
					src={coverLight || cover}
				/>
			)}
			{coverLight && cover && (
				<img
					alt=""
					className={`${className} hidden dark:block`}
					loading={loading}
					src={cover}
				/>
			)}
		</>
	);
}
