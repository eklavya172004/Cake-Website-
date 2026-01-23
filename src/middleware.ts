import { withAuth } from "next-auth/middleware";

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || (token.role !== "admin")) {
        return Response.redirect(new URL("/auth/login", req.url));
      }
    }

    // Protect vendor routes
    if (pathname.startsWith("/vendor")) {
      if (!token || (token.role !== "vendor")) {
        return Response.redirect(new URL("/auth/login", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
