import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET user by ID
export async function GET(req, { params }) {
  const { id } = params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 }
    );
  }
  return NextResponse.json(user);
}

// UPDATE user by ID
export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Gagal update user" }, { status: 400 });
  }
}

// DELETE user by ID
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User dihapus" });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus user" }, { status: 400 });
  }
}