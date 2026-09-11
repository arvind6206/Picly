import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getUserIdFromRequest";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    return NextResponse.json(
      {
        message: "Logout successful",
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
}