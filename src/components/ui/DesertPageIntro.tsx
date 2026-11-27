import type { ReactNode } from "react";
import { DesertAudio } from "#/components/audio/DesertAudio";
import { desertAside, desertRow } from "./desert-layout";

export function DesertPageIntro({
	title,
	description,
	landscape,
	children,
	asideInert,
}: {
	title: string;
	description: string;
	landscape: ReactNode;
	children?: ReactNode;
	asideInert?: boolean;
}) {
	return (
		<div
			className={`${desertRow} border-b border-(--rule) pb-5 min-[56rem]:pb-0`}
		>
			<div className="mx-auto aspect-2/1 w-full min-w-0 max-w-lg self-start [&>*]:h-full min-[56rem]:max-h-(--desert-art-height) min-[56rem]:max-w-none">
				{landscape}
			</div>
			<header
				className={`${desertAside} mt-2 min-[56rem]:mt-0 min-[56rem]:pt-5`}
				inert={asideInert}
			>
				<div className="flex items-start justify-between gap-2">
					<h1 className="text-[1.625rem] font-semibold leading-[1.2]">
						{title}
					</h1>
					<DesertAudio />
				</div>
				<p className="mt-4 max-w-[42ch] text-[0.925rem] min-[56rem]:mt-5">
					{description}
				</p>
				{children}
			</header>
		</div>
	);
}
