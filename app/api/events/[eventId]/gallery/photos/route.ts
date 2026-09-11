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

    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        {
          message: "Photo ID is required",
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

    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId,
      },
    });

    if (!photo || photo.eventId !== eventId) {
      return NextResponse.json(
        {
          message: "Photo not found or does not belong to this event",
        },
        { status: 404 }
      );
    }

    const galleryPhoto = await prisma.galleryPhoto.create({
      data: {
        galleryId: gallery.id,
        photoId,
      },
      include: {
        photo: true,
      },
    });

    return NextResponse.json(
      {
        message: "Photo added to gallery successfully",
        galleryPhoto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD PHOTO TO GALLERY ERROR:", error);

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
