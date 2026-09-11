import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { photoId } = params;

    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId,
      },
      include: {
        event: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        {
          message: "Photo not found",
        },
        { status: 404 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: photo.eventId,
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
          message: "You don't have permission to delete this photo",
        },
        { status: 403 }
      );
    }

    await prisma.photo.delete({
      where: {
        id: photoId,
      },
    });

    return NextResponse.json(
      {
        message: "Photo deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PHOTO ERROR:", error);

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
