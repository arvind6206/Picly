import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { eventId } = await params;
    const body = await req.json();

    const { photoIds } = body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        {
          message: "Photo IDs array is required",
        },
        { status: 400 }
      );
    }

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

    const photos = await prisma.photo.findMany({
      where: {
        id: {
          in: photoIds,
        },
        eventId,
      },
    });

    if (photos.length !== photoIds.length) {
      return NextResponse.json(
        {
          message: "Some photos not found or do not belong to this event",
        },
        { status: 404 }
      );
    }

    const galleryPhotos = await prisma.galleryPhoto.createMany({
      data: photoIds.map((photoId: string) => ({
        galleryId: gallery.id,
        photoId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Photos added to gallery successfully",
        count: galleryPhotos.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD PHOTOS TO GALLERY ERROR:", error);

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
            photo: {
              include: {
                uploadedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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
        photos: gallery.photos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET GALLERY PHOTOS ERROR:", error);

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
