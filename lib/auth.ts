import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

interface JwtPayload {
  userId: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEAM_MEMBER";
}

export async function getUserFromRequest(
  req: NextRequest
): Promise<AuthUser> {
  // Get token from cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Authentication token not found");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function requireAdmin(user: AuthUser): void {
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}

export function requireTeamMemberOrAdmin(user: AuthUser): void {
  if (user.role !== "ADMIN" && user.role !== "TEAM_MEMBER") {
    throw new Error("Team member or admin access required");
  }
}