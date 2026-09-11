import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; userId: string } }
) {
  try {
    const currentUserId = await getUserIdFromRequest(req);
    const { eventId, userId: memberUserId } = params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        createdById: currentUserId,
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or you don't have permission",
        },
        { status: 404 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        members: {
          disconnect: {
            id: memberUserId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Team member removed successfully",
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);

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
