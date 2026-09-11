import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        message: "Invalid authorization format",
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};