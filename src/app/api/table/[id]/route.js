// /app/api/table/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET detail table
export async function GET(request, { params }) {
  const { id } = params;
  const table = await prisma.table.findUnique({
    where: { id },
    include: {
      orders: true,
      reservations: true,
    },
  });
  if (!table)
    return NextResponse.json(
      { error: "Meja tidak ditemukan" },
      { status: 404 }
    );
  return NextResponse.json(table);
}

// PUT update table
export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { number, capacity, status } = body;
  try {
    const updated = await prisma.table.update({
      where: { id },
      data: {
        ...(number !== undefined && { number: Number(number) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(status && { status }),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Gagal update meja" }, { status: 400 });
  }
}

// DELETE table
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ message: "Meja dihapus" });
  } catch (e) {
    return NextResponse.json({ error: "Gagal hapus meja" }, { status: 400 });
  }
}
