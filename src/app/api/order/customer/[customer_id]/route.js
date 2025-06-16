import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, context) {
  // ✅ PERBAIKAN: await context.params
  const params = await context.params;
  const { customer_id } = params;

  if (!customer_id) {
    return NextResponse.json(
      { error: "customer_id diperlukan" },
      { status: 400 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customer_id },
      orderBy: { order_number: "desc" },
      include: {
        table: true,
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

    const formatted = orders.map((order) => ({
      ...order,
      customer_name: order.customer?.name ?? null,
      table_number: order.table?.number ?? null, // <- tambahkan ini
      items: order.orderItems.map((oi) => ({
        quantity: oi.quantity,
        menu_name: oi.menuItem?.name ?? null,
        price: oi.menuItem?.price ?? null,
        category: oi.menuItem?.category ?? null,
        imageUrl: oi.menuItem?.imageUrl ?? null,
      })),
      orderItems: undefined,
      customer: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data orders" },
      { status: 500 }
    );
  }
}
