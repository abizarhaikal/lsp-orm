// app/api/table/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all tables
export async function GET() {
  const tables = await prisma.table.findMany();
  return NextResponse.json(tables);
}

// POST new table
export async function POST(req) {
  const { number, capacity, status } = await req.json();
  const table = await prisma.table.create({
    data: {
      number: Number(number),
      capacity: Number(capacity),
      status: status || "Tersedia",
    },
  });
  return NextResponse.json(table, { status: 201 });
}
