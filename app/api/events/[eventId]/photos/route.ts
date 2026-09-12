import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireTeamMemberOrAdmin } from "@/lib/auth";
import { uploadFileToSupabase, generateStorageKey, isStorageConfigured } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    requireTeamMemberOrAdmin(user);

    const { eventId } = await params;

    // Handle multipart form data for actual file upload
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          message: "File is required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: "File size must be less than 10MB",
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          {
            createdById: user.id,
          },
          {
            members: {
              some: {
                id: user.id,
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

    let storageUrl: string;
    let storageKey: string;

    if (isStorageConfigured()) {
      // Upload to Supabase Storage
      storageKey = generateStorageKey(eventId, file.name);
      const uploadResult = await uploadFileToSupabase(file, storageKey);
      storageUrl = uploadResult.url;
      storageKey = uploadResult.key;
    } else {
      // Fallback to dummy implementation
      storageKey = `dummy/${file.name}`;
      storageUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
    }

    const photo = await prisma.photo.create({
      data: {
        eventId,
        uploadedById: user.id,
        filename: file.name,
        storageKey,
        storageUrl,
        fileSize: file.size,
      },
    });

    return NextResponse.json(
      {
        message: "Photo uploaded successfully",
        photo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("UPLOAD PHOTO ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.message.includes("access required") ? 403 : 401 }
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
    const user = await getUserFromRequest(req);
    requireTeamMemberOrAdmin(user);

    const { eventId } = await params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          {
            createdById: user.id,
          },
          {
            members: {
              some: {
                id: user.id,
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

    const photos = await prisma.photo.findMany({
      where: {
        eventId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.error("GET PHOTOS ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.message.includes("access required") ? 403 : 401 }
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
