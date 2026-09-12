import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations/event";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    requireAdmin(user);

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

    const { name, description, eventDate } = result.data;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        eventDate,
        createdById: user.id,
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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    const events = await prisma.event.findMany({
      where: {
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
