import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "../lib/auth";
import { Navbar } from "../components/Navbar";
import { authApi } from "../lib/api";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const publicPaths = ["/login", "/register"];
    const isPublic = publicPaths.includes(location.pathname);

    if (!isPublic) {
      try {
        const session: any = await authApi.session();
        if (!session?.user) {
          throw redirect({ to: "/login" });
        }
      } catch (e: any) {
        if (e?.isRedirect) throw e;
        throw redirect({ to: "/login" });
      }
    }
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}

function InnerLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Cargando...
      </div>
    );
  }

  const isAuthPage =
    window.location.pathname === "/login" ||
    window.location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50">
      {user && !isAuthPage && <Navbar />}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}