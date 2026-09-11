import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";
import { updateEventSchema } from "@/lib/validations/event";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          {
            createdById: userId,
          },
          {
            members: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET EVENT ERROR:", error);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = params;
    const body = await req.json();

    const result = updateEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        createdById: userId,
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

    const { name, description, eventDate } = result.data;

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
      },
    });

    return NextResponse.json(
      {
        message: "Event updated successfully",
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

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
