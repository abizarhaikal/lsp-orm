import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all users
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(users);
}