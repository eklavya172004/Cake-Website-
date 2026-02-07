import { withAuth } from "next-auth/middleware";

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || (token.role !== "admin")) {
        const loginUrl = new URL("/auth/login", req.url);
        return Response.redirect(loginUrl);
      }
    }

    // Protect vendor routes
    if (pathname.startsWith("/vendor")) {
      if (!token || (token.role !== "vendor")) {
        const loginUrl = new URL("/auth/login", req.url);
        return Response.redirect(loginUrl);
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Admin routes require admin role
        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }
        
        // Vendor routes require vendor role
        if (pathname.startsWith("/vendor")) {
          return token?.role === "vendor";
        }
        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
