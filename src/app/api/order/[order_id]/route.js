import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper ambil user_id (misal dari header, session, dsb)
function getUserId(request) {
  // Contoh: dari custom header (atau ubah sesuai kebutuhanmu)
  return request.headers.get("x-user-id") || null;
}

// GET detail satu order
export async function GET(request, context) {
  const params = await context.params;
  const order_id = params?.order_id;

  if (!order_id) {
    return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        customer: { select: { name: true, email: true } },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...order,
      customer_name: order.customer?.name ?? null,
      items: order.orderItems.map((oi) => ({
        quantity: oi.quantity,
        menu_name: oi.menuItem?.name ?? null,
        price: oi.menuItem?.price ?? null,
        category: oi.menuItem?.category ?? null,
        imageUrl: oi.menuItem?.imageUrl ?? null,
      })),
      orderItems: undefined,
      customer: undefined,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const params = await context.params;
  const order_id = params.order_id;
  if (!order_id) {
    return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 });
  }
  try {
    const body = await request.json();

    // Siapkan data update
    const dataToUpdate = {};
    if (body.status) dataToUpdate.status = body.status;
    if (body.paymentStatus) dataToUpdate.paymentStatus = body.paymentStatus;

    // Update relasi meja sesuai body.table_id
    if (body.table_id) {
      dataToUpdate.table = { connect: { id: body.table_id } };
    } else if (body.table_id === null) {
      // Jika ingin disconnect meja (hapus relasi)
      dataToUpdate.table = { disconnect: true };
    }

    const updated = await prisma.order.update({
      where: { id: order_id },
      data: dataToUpdate,
    });

    // Insert activity log
    const userId = getUserId(request);
    let changed = [];
    if (body.status) changed.push(`status: ${body.status}`);
    if (body.paymentStatus)
      changed.push(`paymentStatus: ${body.paymentStatus}`);
    if (body.table_id) changed.push(`table: ${body.table_id}`);

    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action: "update",
        target: "Order",
        target_id: order_id,
        message: `Update order #${updated.order_number} [${changed.join(
          ", "
        )}]`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE hapus satu order (+ log aktivitas)
export async function DELETE(request, context) {
  const params = await context.params;
  const order_id = params?.order_id;

  if (!order_id) {
    return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 });
  }

  try {
    const deleted = await prisma.order.delete({ where: { id: order_id } });

    // Insert activity log
    const userId = getUserId(request);
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        action: "delete",
        target: "Order",
        target_id: order_id,
        message: `Order #${deleted.order_number} dihapus`,
      },
    });

    return NextResponse.json({ message: "Order dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
