import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log("PROXY PATH:", pathname);
  console.log("PROXY TOKEN EXISTS:", !!req.cookies.get("token")?.value);

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("PROXY: TOKEN NOT FOUND");

    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  console.log("PROXY: TOKEN FOUND");

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};