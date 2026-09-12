import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireTeamMemberOrAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireTeamMemberOrAdmin(user);

    const { photoId } = await params;

    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "You don't have permission to view this photo",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        photo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PHOTO ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.message.includes("access required") ? 403 : 401 }
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
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireTeamMemberOrAdmin(user);

    const { photoId } = await params;

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

    if (user.role === "ADMIN") {
      const event = await prisma.event.findFirst({
        where: {
          id: photo.eventId,
          createdById: user.id,
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
    } else {
      if (photo.uploadedById !== user.id) {
        return NextResponse.json(
          {
            message: "You can only delete your own photos",
          },
          { status: 403 }
        );
      }
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
        { status: error.message.includes("access required") ? 403 : 401 }
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
