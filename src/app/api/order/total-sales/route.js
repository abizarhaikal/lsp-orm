import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Ambil semua order yang sudah dibayar
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: { in: ["success", "paid"] },
    },
    include: {
      orderItems: {
        include: { menuItem: true },
      },
    },
  });

  // Kalkulasi total omzet
  let totalSales = 0;
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      // item.menuItem bisa saja null jika datanya tidak ada (pastikan aman)
      if (item.menuItem) {
        totalSales += item.menuItem.price * item.quantity;
      } else if (item.price) {
        // fallback kalau pakai item.price
        totalSales += item.price * item.quantity;
      }
    });
  });

  return NextResponse.json({ totalSales });
}
