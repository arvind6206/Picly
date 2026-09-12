import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations/event";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    const { eventId } = await params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          {
            createdById: user.id,
          },
          {
            members: {
              some: {
                id: user.id,
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
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireAdmin(user);

    const { eventId } = await params;
    const body = await req.json();

    const result = createEventSchema.safeParse(body);

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
        createdById: user.id,
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
      data: result.data
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
        { status: error.message.includes("Admin") ? 403 : 401 }
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireAdmin(user);

    const { eventId } = await params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        createdById: user.id,
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

    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json(
      {
        message: "Event deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.message.includes("Admin") ? 403 : 401 }
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
