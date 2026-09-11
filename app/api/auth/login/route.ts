import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Incorrect password",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}