import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const gallery = await prisma.gallery.findUnique({
      where: {
        token,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            eventDate: true,
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

    if (!gallery.isPublished) {
      return NextResponse.json(
        {
          message: "Gallery is not published",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        gallery: {
          id: gallery.id,
          token: gallery.token,
          event: gallery.event,
          isPublished: gallery.isPublished,
          publishedAt: gallery.publishedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET GALLERY ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
