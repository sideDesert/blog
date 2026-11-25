import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const pagesBase = process.env.GITHUB_PAGES_BASE
const base = pagesBase ? `${pagesBase.replace(/\/$/, '')}/` : '/'

const config = defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart({
      pages: [{ path: base }],
      prerender: {
        enabled: Boolean(pagesBase),
        autoStaticPathsDiscovery: false,
        failOnError: true,
      },
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
