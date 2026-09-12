import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; photoId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireAdmin(user);

    const { eventId, photoId } = await params;

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

    const gallery = await prisma.gallery.findUnique({
      where: {
        eventId,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        {
          message: "Gallery not found",
        },
        { status: 404 }
      );
    }

    const galleryPhoto = await prisma.galleryPhoto.findUnique({
      where: {
        galleryId_photoId: {
          galleryId: gallery.id,
          photoId,
        },
      },
    });

    if (!galleryPhoto) {
      return NextResponse.json(
        {
          message: "Photo not found in gallery",
        },
        { status: 404 }
      );
    }

    await prisma.galleryPhoto.delete({
      where: {
        galleryId_photoId: {
          galleryId: gallery.id,
          photoId,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Photo removed from gallery successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REMOVE PHOTO FROM GALLERY ERROR:", error);

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
