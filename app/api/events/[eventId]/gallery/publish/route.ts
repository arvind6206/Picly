import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { publishGallerySchema } from "@/lib/validations/gallery";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireAdmin(user);

    const { eventId } = await params;

    // Ensure request has JSON content type
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { message: "Unsupported Media Type: Expected application/json" },
        { status: 415 }
      );
    }

    // Parse body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

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
