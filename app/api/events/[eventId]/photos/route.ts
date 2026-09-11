import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = params;
    const body = await req.json();

    const { filename, storageKey, storageUrl, fileSize } = body;

    if (!filename || !storageKey || !fileSize) {
      return NextResponse.json(
        {
          message: "filename, storageKey, and fileSize are required",
        },
        { status: 400 }
      );
    }

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
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or you don't have permission",
        },
        { status: 404 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        eventId,
        uploadedById: userId,
        filename,
        storageKey,
        storageUrl,
        fileSize,
      },
    });

    return NextResponse.json(
      {
        message: "Photo uploaded successfully",
        photo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("UPLOAD PHOTO ERROR:", error);

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
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or you don't have permission",
        },
        { status: 404 }
      );
    }

    const photos = await prisma.photo.findMany({
      where: {
        eventId,
      },
      include: {
        uploadedBy: {
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
        photos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PHOTOS ERROR:", error);

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
