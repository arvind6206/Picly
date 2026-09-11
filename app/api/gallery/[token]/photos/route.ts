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

    const photos = await prisma.galleryPhoto.findMany({
      where: {
        galleryId: gallery.id,
      },
      include: {
        photo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        photos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET GALLERY PHOTOS ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
