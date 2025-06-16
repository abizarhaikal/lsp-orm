import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: Get user_id dari headers (bisa diganti pakai session)
function getUserId(req) {
  return req.headers.get("x-user-id") || null;
}
function getId(params) {
  return params.id;
}

// GET /api/reservation/[id]
export async function GET(req, { params }) {
  const id = getId(params);
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true } },
      },
    });
    if (!reservation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(
      {
        ...reservation,
        customer_name: reservation.customer?.name ?? null,
        customer_email: reservation.customer?.email ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// === UTAMA: UPDATE NOMOR MEJA & STATUS ===
// PUT /api/reservation/[id]
export async function PUT(req, { params }) {
  const id = getId(params);
  try {
    const { customer_id, table_id, guest_count, status } = await req.json();

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        guest_count: guest_count ?? undefined,
        status: status ?? undefined,
        table: table_id ? { connect: { id: table_id } } : undefined,
        // jangan isi customer_id jika tidak perlu update relasi customer
      },
      include: {
        customer: { select: { name: true, email: true } },
        table: true,
      },
    });

    // Log aktivitas
    const userId = getUserId(req) || customer_id;
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action: "update",
        target: "Reservation",
        target_id: id,
        message: `Reservasi meja diupdate (status: ${status}, guest: ${guest_count})`,
      },
    });

    return NextResponse.json(
      {
        ...updated,
        customer_name: updated.customer?.name ?? null,
        customer_email: updated.customer?.email ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/reservation/[id]
export async function DELETE(req, { params }) {
  const id = getId(params);
  try {
    const deleted = await prisma.reservation.delete({
      where: { id },
      include: {
        customer: { select: { name: true, email: true } },
      },
    });

    // Log aktivitas
    const userId = getUserId(req) || deleted.customer_id;
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action: "delete",
        target: "Reservation",
        target_id: id,
        message: `Reservasi meja dibatalkan/deleted`,
      },
    });

    return NextResponse.json(
      {
        ...deleted,
        customer_name: deleted.customer?.name ?? null,
        customer_email: deleted.customer?.email ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
