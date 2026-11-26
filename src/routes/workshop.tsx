import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import blogReference from "#/assets/workshop/blog-reference.webp";
import projectsReference from "#/assets/workshop/projects-reference.webp";
import {
	sceneryLayers,
	scenes,
	type WorkshopLayer,
	WorkshopScene,
	type WorkshopSceneName,
} from "#/components/ascii-art/workshop/WorkshopScene";
import { desertMain } from "#/components/ui/desert-layout";

export const Route = createFileRoute("/workshop")({
	component: Workshop,
	head: () => ({ meta: [{ title: "Workshop | sideDesert" }] }),
});

const referenceImages: Partial<Record<WorkshopSceneName, string>> = {
	projects: projectsReference,
	blog: blogReference,
};

function Workshop() {
	const [scene, setScene] = useState<WorkshopSceneName>("projects");
	const [hiddenByScene, setHiddenByScene] = useState<
		Partial<Record<WorkshopSceneName, ReadonlySet<WorkshopLayer>>>
	>({});
	const [isolatedLayer, setIsolatedLayer] = useState<WorkshopLayer>();
	const [dither, setDither] = useState(true);
	const [referenceOpacity, setReferenceOpacity] = useState(0);
	const reference = referenceImages[scene];
	const layers = useMemo(
		() => [...sceneryLayers, ...scenes[scene].layers],
		[scene],
	);
	const hidden = useMemo(
		() =>
			isolatedLayer
				? new Set(
						layers.map(({ id }) => id).filter((id) => id !== isolatedLayer),
					)
				: hiddenByScene[scene],
		[hiddenByScene, isolatedLayer, layers, scene],
	);

	function toggle(layer: WorkshopLayer) {
		setHiddenByScene((previous) => {
			const next = new Set(previous[scene]);
			if (!next.delete(layer)) next.add(layer);
			return { ...previous, [scene]: next };
		});
	}

	return (
		<main className={desertMain}>
			<header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-(--rule) py-5">
				<h1 className="text-[1.625rem] font-semibold">Desert Workshop</h1>
				<Link to="/projects" className="underline underline-offset-4">
					Projects
				</Link>
			</header>
			<div className="flex flex-col gap-5 py-5 md:grid md:grid-cols-[minmax(0,1fr)_12rem]">
				<div className="sticky top-0 z-10 min-w-0 bg-background md:self-start">
					<WorkshopScene scene={scene} hidden={hidden} dither={dither} />
					{reference && referenceOpacity > 0 && (
						<img
							src={reference}
							alt={`${scene === "projects" ? "Projects" : "Blog"} reference artwork`}
							className="pointer-events-none absolute inset-0 h-full w-full"
							style={{ opacity: referenceOpacity / 100 }}
							width={1000}
							height={500}
						/>
					)}
				</div>
				<fieldset className="space-y-2 border-t border-(--rule) pt-3 md:border-t-0 md:border-l md:pl-4 md:pt-0">
					<legend className="mb-2 font-semibold">Scene layers</legend>
					<label className="block border-b border-(--rule) pb-3">
						<span className="block">Reference scene</span>
						<select
							className="mt-1 border border-(--rule) bg-background p-1"
							value={scene}
							onChange={(event) => {
								setIsolatedLayer(undefined);
								setScene(
									event.currentTarget.value === "about"
										? "about"
										: event.currentTarget.value === "blog"
											? "blog"
											: "projects",
								);
							}}
						>
							<option value="projects">Projects</option>
							<option value="blog">Blog</option>
							<option value="about">About</option>
						</select>
					</label>
					{reference && (
						<label className="block border-b border-(--rule) pb-3">
							<span className="flex justify-between gap-2">
								Reference overlay <span>{referenceOpacity}%</span>
							</span>
							<input
								type="range"
								min={0}
								max={100}
								step={5}
								value={referenceOpacity}
								onChange={(event) =>
									setReferenceOpacity(event.currentTarget.valueAsNumber)
								}
								className="mt-2 block w-full"
								aria-label="Reference overlay"
							/>
						</label>
					)}
					<label className="block border-b border-(--rule) pb-3">
						<span className="block">Inspect a layer</span>
						<select
							className="mt-1 w-full border border-(--rule) bg-background p-1"
							value={isolatedLayer ?? ""}
							onChange={(event) => {
								const selected = event.currentTarget.value;
								setIsolatedLayer(layers.find(({ id }) => id === selected)?.id);
							}}
						>
							<option value="">All enabled layers</option>
							{layers.map(({ id, label }) => (
								<option key={id} value={id}>
									{label}
								</option>
							))}
						</select>
					</label>
					<fieldset
						disabled={isolatedLayer !== undefined}
						className="space-y-2 disabled:opacity-50"
					>
						{layers.map(({ id, label }) => (
							<label
								key={id}
								className="flex cursor-pointer items-center gap-2"
							>
								<input
									type="checkbox"
									checked={!hidden?.has(id)}
									onChange={() => toggle(id)}
								/>
								{label}
							</label>
						))}
					</fieldset>
					<label className="flex cursor-pointer items-center gap-2 border-t border-(--rule) pt-3">
						<input
							type="checkbox"
							checked={dither}
							onChange={(event) => setDither(event.currentTarget.checked)}
						/>
						Ordered dither
					</label>
				</fieldset>
			</div>
		</main>
	);
}
