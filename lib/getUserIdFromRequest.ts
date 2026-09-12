import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string> {
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

    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}