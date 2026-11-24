import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blog')({ component: Blog })

function Blog() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Blog</p>
        <h1 className="mb-3 text-4xl font-bold text-foreground sm:text-5xl">
          Writing in progress.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-muted-foreground">
          Posts will land here.
        </p>
      </section>
    </main>
  )
}
