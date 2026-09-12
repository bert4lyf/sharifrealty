import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ClientOnly,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StickyMobileCta } from "@/components/sticky-mobile-cta";
import { PageLoader } from "@/components/page-loader";
import { Analytics } from "@/components/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { NotFound } from "@/components/not-found";
import { localBusinessJsonLd } from "@/components/jsonld";
import { AdminProvider } from "@/lib/admin-store";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="secondary">
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sharif Realty | Real Estate & Business Sales in Connecticut & Massachusetts" },
      {
        name: "description",
        content:
          "Sharif Realty Group: over 35 years of experience in residential, commercial, and business real estate across Connecticut and Massachusetts. Led by Majeed Sharif.",
      },
      { name: "author", content: "Sharif Realty Group" },
      { property: "og:site_name", content: "Sharif Realty Group" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
      },
      { rel: "icon", href: "/wp-content/uploads/SHARIF-REALTY-LOGO.png", type: "image/png" },
{ rel: "apple-touch-icon", href: "/wp-content/uploads/SHARIF-REALTY-LOGO.png" },

    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd()),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#FAF8F5]">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#FAF8F5] text-[#1E293B] antialiased selection:bg-[#C5A880] selection:text-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isBackOffice = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        {/* Logo Page Loading Animation */}
        <PageLoader />

        {isBackOffice ? (
          <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B1120]">
            <Outlet />
          </div>
        ) : (
          <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#1E293B] pb-16 md:pb-0">
            <SiteHeader />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
            <StickyMobileCta />
          </div>
        )}
      </AdminProvider>
      <Toaster position="top-center" />
      <ClientOnly fallback={null}>
        <Analytics />
      </ClientOnly>
      <VercelAnalytics />
    </QueryClientProvider>
  );
}
