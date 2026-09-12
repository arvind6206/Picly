import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
  ];

  // Allow login/register without authentication
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get JWT from HTTP-only cookie
  const token = req.cookies.get("token")?.value;

  console.log("PROXY TOKEN EXISTS:", !!token);

  if (!token) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};