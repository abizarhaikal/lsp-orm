import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import shortid from "shortid";

// Helper: Format output order agar lebih mudah dipakai frontend
function formatOrder(order) {
  return {
    ...order,
    paymentStatus: order.paymentStatus || "pending",
    paymentMethod: order.paymentMethod || null,
    customer_name: order.customer?.name ?? null,
    table_number: order.table?.number ?? null,
    items: order.orderItems.map((oi) => ({
      quantity: oi.quantity,
      menu_name: oi.menuItem?.name ?? null,
      price: oi.menuItem?.price ?? null,
      category: oi.menuItem?.category ?? null,
      imageUrl: oi.menuItem?.imageUrl ?? null,
    })),
    orderItems: undefined, // hilangkan properti raw agar tidak bingung frontend
    customer: undefined,
    table: undefined,
  };
}

// GET all orders
export async function GET(req) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { order_number: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        table: true,
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

    const formattedOrders = orders.map(formatOrder);
    return NextResponse.json(formattedOrders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create new order
// POST create new order
export async function POST(req) {
  try {
    const {
      customer_id,
      table_id,
      items,
      status,
      paymentStatus,
      paymentMethod,
    } = await req.json();

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id wajib diisi" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items harus array tidak kosong" },
        { status: 400 }
      );
    }

    const order_number = "ORD-" + shortid.generate();

    // Create Order
    const order = await prisma.order.create({
      data: {
        order_number,
        customer: { connect: { id: customer_id } },
        table: table_id ? { connect: { id: table_id } } : undefined,
        status,
        paymentStatus,
        paymentMethod,
        orderItems: {
          create: items.map(({ menu_item_id, quantity }) => ({
            menu_item_id,
            quantity,
          })),
        },
      },
      include: {
        customer: { select: { name: true, email: true } },
        table: true,
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

    // decrease stock for each menu item
    await Promise.all(
      items.map(async ({ menu_item_id, quantity }) => {
        const menuItem = await prisma.menuItem.update({
          where: { id: menu_item_id },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        if (menuItem.stock < 0) {
          throw new Error(`Stok untuk menu item ${menuItem.name} tidak cukup`);
        }
      })
    );

    // Tambahkan log aktivitas
    await prisma.activityLog.create({
      data: {
        user_id: customer_id, // user yang melakukan (pelanggan)
        action: "create",
        target: "Order",
        target_id: order.id, // id order yang baru dibuat
        message: `Order ${order.order_number} dibuat oleh ${
          order.customer?.name ?? "pelanggan"
        }`,
      },
    });

    // Format sebelum kirim ke frontend
    const formatted = formatOrder(order);

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
