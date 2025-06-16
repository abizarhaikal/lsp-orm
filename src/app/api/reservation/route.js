import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservation?customer_id=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customer_id = searchParams.get("customer_id");

  try {
    let reservations;
    if (customer_id) {
      reservations = await prisma.reservation.findMany({
        where: { customer_id },
        include: {
          customer: { select: { name: true, email: true } },
          table: true,
        },
        orderBy: [{ reservation_date: "desc" }, { reservation_time: "desc" }],
      });
    } else {
      reservations = await prisma.reservation.findMany({
        include: {
          customer: { select: { name: true, email: true } },
          table: true,
        },
        orderBy: [{ reservation_date: "desc" }, { reservation_time: "desc" }],
      });
    }

    const formatted = reservations.map((r) => ({
      ...r,
      customer_name: r.customer?.name ?? null,
      customer_email: r.customer?.email ?? null,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("GET /api/reservation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/reservation
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      customer_id,
      guest_count,
      reservation_date,
      reservation_time,
      status,
      table_id,
    } = body;

    // Validasi data required
    const missingFields = [];
    if (!customer_id) missingFields.push("customer_id");
    if (!guest_count) missingFields.push("guest_count");
    if (!reservation_date) missingFields.push("reservation_date");
    if (!reservation_time) missingFields.push("reservation_time");
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Field wajib tidak boleh kosong: ${missingFields.join(", ")}`,
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Validasi guest_count harus number
    const guestCountNum = Number(guest_count);
    if (isNaN(guestCountNum) || guestCountNum <= 0) {
      return NextResponse.json(
        { error: "Jumlah tamu harus berupa angka positif" },
        { status: 400 }
      );
    }

    // Validasi dan konversi reservation_date
    let reservationDateObj;
    try {
      reservationDateObj = new Date(reservation_date);
      if (isNaN(reservationDateObj.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (dateError) {
      return NextResponse.json(
        { error: "Format tanggal reservasi tidak valid" },
        { status: 400 }
      );
    }

    // Validasi reservation_time format (HH:MM)
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(reservation_time)) {
      return NextResponse.json(
        { error: "Format waktu tidak valid (gunakan HH:MM)" },
        { status: 400 }
      );
    }

    // Validasi customer_id exists (PASTIKAN pakai User)
    const customerExists = await prisma.user.findUnique({
      where: { id: customer_id },
    });
    if (!customerExists) {
      return NextResponse.json(
        { error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi table_id jika ada
    if (
      table_id &&
      table_id !== null &&
      table_id !== "" &&
      table_id !== "none"
    ) {
      const tableExists = await prisma.table.findUnique({
        where: { id: table_id },
      });

      if (!tableExists) {
        return NextResponse.json(
          { error: "Meja tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check table capacity vs guest count
      if (tableExists.capacity < guestCountNum) {
        return NextResponse.json(
          {
            error: `Kapasitas meja (${tableExists.capacity}) tidak mencukupi untuk ${guestCountNum} tamu`,
          },
          { status: 400 }
        );
      }
    }

    // Data untuk create reservation
    const reservationData = {
      customer_id,
      guest_count: guestCountNum,
      reservation_date: reservationDateObj,
      reservation_time,
      status: status || "pending",
      table_id:
        table_id && table_id !== "none" && table_id !== "" ? table_id : null,
    };

    const newReservation = await prisma.reservation.create({
      data: reservationData,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            // phone: true, // Uncomment if User punya field phone
          },
        },
        table: true,
      },
    });

    // Format response
    const response = {
      ...newReservation,
      customer_name: newReservation.customer?.name ?? null,
      customer_email: newReservation.customer?.email ?? null,
      // customer_phone: newReservation.customer?.phone ?? null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/reservation error:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Konflik data: mungkin reservasi sudah ada" },
        { status: 409 }
      );
    }

    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Referensi data tidak valid" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Terjadi kesalahan server",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/reservation (untuk update status, dll)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID reservasi diperlukan" },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true } },
        table: true,
      },
    });

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (err) {
    console.error("PUT /api/reservation error:", err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/reservation
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID reservasi diperlukan" },
        { status: 400 }
      );
    }

    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Reservasi berhasil dihapus" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/reservation error:", err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
