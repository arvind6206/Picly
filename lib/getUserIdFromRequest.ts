import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Authorization header missing");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization format");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Token missing");
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