import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";
import { createGallerySchema } from "@/lib/validations/gallery";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = await params;
    const body = await req.json();

    const result = createGallerySchema.safeParse(body);

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

    const existingGallery = await prisma.gallery.findUnique({
      where: {
        eventId,
      },
    });

    if (existingGallery) {
      return NextResponse.json(
        {
          message: "Gallery already exists for this event",
        },
        { status: 400 }
      );
    }

    const token = randomBytes(16).toString("hex");
    const pinHash = await bcrypt.hash(pin, 10);

    const gallery = await prisma.gallery.create({
      data: {
        eventId,
        createdById: userId,
        token,
        pinHash,
        isPublished: false,
      },
    });

    return NextResponse.json(
      {
        message: "Gallery created successfully",
        gallery,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE GALLERY ERROR:", error);

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
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = await params;

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
      include: {
        photos: {
          include: {
            photo: true,
          },
        },
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

    return NextResponse.json(
      {
        gallery,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET GALLERY ERROR:", error);

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
