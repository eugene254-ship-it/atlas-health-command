import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-titanium-900 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-mono font-bold text-titanium-100">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-titanium-100">Signal not found</h2>
        <p className="mt-2 text-sm text-titanium-400">
          The directive you're looking for doesn't exist or has been rescinded.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-titanium-600 bg-titanium-700 px-4 py-2 font-mono text-xs uppercase tracking-wider text-titanium-100 transition-colors hover:bg-titanium-600"
          >
            Return to Command
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atlas Sanctum — WHS Intelligence Dashboard" },
      {
        name: "description",
        content: "Continental health intelligence cockpit for WHS Nairobi 2026.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    htmlAttrs: { lang: "en", class: "dark" },
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
