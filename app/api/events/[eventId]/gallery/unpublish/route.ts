import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";

export async function POST(
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

    const updatedGallery = await prisma.gallery.update({
      where: {
        id: gallery.id,
      },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });

    return NextResponse.json(
      {
        message: "Gallery unpublished successfully",
        gallery: updatedGallery,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UNPUBLISH GALLERY ERROR:", error);

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
