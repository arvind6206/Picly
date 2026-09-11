import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";
import { createEventSchema } from "@/lib/validations/event";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Only admins can create events",
        },
        { status: 403 }
      );
    }

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

    const { name, description, eventDate } = result.data;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        eventDate,
        createdById: userId,
      },
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    const events = await prisma.event.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

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
