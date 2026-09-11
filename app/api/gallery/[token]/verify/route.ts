import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json();

    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        {
          message: "PIN is required",
        },
        { status: 400 }
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

    const isPinValid = await bcrypt.compare(pin, gallery.pinHash);

    if (!isPinValid) {
      return NextResponse.json(
        {
          message: "Invalid PIN",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "PIN verified successfully",
        valid: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY PIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
