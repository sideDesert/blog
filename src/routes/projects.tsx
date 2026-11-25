import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  return (
    <main className="mx-auto px-4 py-12">
      <section className="">
        <p className="">Projects</p>
        <h1 className="">Work in progress.</h1>
        <p className="">Projects will land here.</p>
      </section>
    </main>
  );
}
