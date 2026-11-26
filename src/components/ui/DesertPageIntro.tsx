import type { ReactNode } from "react";
import { DesertAudio } from "#/components/audio/DesertAudio";
import { desertAside, desertRow } from "./desert-layout";

export function DesertPageIntro({
	title,
	description,
	landscape,
	children,
	className = "",
}: {
	title: string;
	description: string;
	landscape: ReactNode;
	children?: ReactNode;
	className?: string;
}) {
	return (
		<div className={`${desertRow} ${className}`}>
			<div className="min-w-0 min-[56rem]:aspect-[2/1] min-[56rem]:self-start min-[56rem]:[&>*]:h-full">
				{landscape}
			</div>
			<header className={`${desertAside} min-[56rem]:pt-5`}>
				<div className="flex items-start justify-between gap-2">
					<h1 className="text-[1.625rem] font-semibold leading-[1.2]">
						{title}
					</h1>
					<DesertAudio />
				</div>
				<p className="mt-5 text-[0.925rem]">{description}</p>
				{children}
			</header>
		</div>
	);
}
