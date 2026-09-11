import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ME ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
