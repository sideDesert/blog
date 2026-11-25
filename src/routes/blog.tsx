import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({ component: Blog });

function Blog() {
  return (
    <main className="mx-auto px-4 py-12">
      <section className="">
        <p className="">Blog</p>
        <h1 className="">Writing in progress.</h1>
        <p className="">Posts will land here.</p>
      </section>
    </main>
  );
}
