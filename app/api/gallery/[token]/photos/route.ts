import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

interface GalleryJwtPayload {
  galleryId: string;
  galleryToken: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          message: "Authorization header missing",
        },
        { status: 401 }
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Invalid authorization format",
        },
        { status: 401 }
      );
    }

    const galleryAccessToken = authHeader.split(" ")[1];

    if (!galleryAccessToken) {
      return NextResponse.json(
        {
          message: "Gallery access token missing",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      galleryAccessToken,
      process.env.JWT_SECRET!
    ) as GalleryJwtPayload;

    if (decoded.galleryToken !== token) {
      return NextResponse.json(
        {
          message: "Invalid gallery token",
        },
        { status: 403 }
      );
    }

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

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          message: "Invalid or expired gallery access token",
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
