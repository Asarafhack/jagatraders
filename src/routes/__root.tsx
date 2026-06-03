import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { PageLoader } from "@/components/PageLoader";
import { LoginModal } from "@/components/LoginModal";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Toaster } from "@/components/ui/sonner";

// --- Components ---

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
        </div>
      </div>
    </div>
  );
}

// --- Root Route Definition ---

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jaga Traders — Premium Badminton Gear" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  // The component contains the providers so they wrap all routes
  component: () => (
    <RootShell>
      <Outlet />
    </RootShell>
  ),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StoreProvider>
              <PageLoader />
              <Cursor />
              <Header />
              <main className="min-h-screen pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
              <WhatsAppFab />
              <LoginModal />
              <Toaster />
            </StoreProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}