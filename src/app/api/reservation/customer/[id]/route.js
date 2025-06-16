import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservation/customer/[id]
export async function GET(req, { params }) {
  const customer_id = params.id;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { customer_id },
      include: {
        table: true,
        customer: { select: { name: true, email: true } },
      },
      orderBy: [{ reservation_date: "desc" }, { reservation_time: "desc" }],
    });

    const formatted = reservations.map((r) => ({
      ...r,
      customer_name: r.customer?.name ?? null,
      customer_email: r.customer?.email ?? null,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
