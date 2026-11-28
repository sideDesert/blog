import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { DesertAudioProvider } from "#/components/audio/DesertAudioContext";
import { TooltipProvider } from "#/components/ui/tooltip";
import { appearanceInitScript } from "#/lib/appearance";
import Footer from "../components/Footer";
import Header from "../components/Header";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "sideDesert | Siddarth Saha",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "128x128",
        href: `${import.meta.env.BASE_URL}favicon.png`,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Runs the bundled appearance factory before CSS. */}
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript }} />
        <HeadContent />
      </head>
      <body className="wrap:anywhere overflow-x-hidden bg-background font-mono text-foreground antialiased selection:bg-foreground selection:text-background [&_code]:rounded-[7px] [&_code]:border [&_code]:border-border [&_code]:bg-accent [&_code]:px-[7px] [&_code]:py-[2px] [&_code]:text-[0.9em] [&_*:focus-visible]:outline-foreground [&_*::selection]:bg-foreground [&_*::selection]:text-background">
        <DesertAudioProvider>
          <TooltipProvider>
            <Header />

            {children}
            <Footer />
          </TooltipProvider>
        </DesertAudioProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
            hideUntilHover: true,
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
