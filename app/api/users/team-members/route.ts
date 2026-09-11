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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Only admins can view team members",
        },
        { status: 403 }
      );
    }

    const teamMembers = await prisma.user.findMany({
      where: {
        role: "TEAM_MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        users: teamMembers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET TEAM MEMBERS ERROR:", error);

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
