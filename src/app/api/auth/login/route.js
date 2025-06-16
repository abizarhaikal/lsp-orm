import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password, role } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Email tidak ditemukan" },
      { status: 401 }
    );
  }

  // Cek password hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  // Cek role
  if (user.role !== role) {
    return NextResponse.json({ error: "Role tidak sesuai" }, { status: 403 });
  }

  // Sukses: kirim data tanpa password
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
