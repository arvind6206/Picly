import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";
import { publishGallerySchema } from "@/lib/validations/gallery";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = params;
    const body = await req.json();

    const result = publishGallerySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { pin } = result.data;

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

    const pinHash = await bcrypt.hash(pin, 10);

    const updatedGallery = await prisma.gallery.update({
      where: {
        id: gallery.id,
      },
      data: {
        pinHash,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Gallery published successfully",
        gallery: updatedGallery,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUBLISH GALLERY ERROR:", error);

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
