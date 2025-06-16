"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, User } from "lucide-react";

export default function AdminOverview(props) {
  // Ambil data orders dari props (pastikan dikirim dari parent)
  const orders = props.orders || [];
  const ingredients = props.ingredients || [];
  const staff = props.staff || [];

  // Hitung total penjualan hanya order sukses/paid
  const totalSales = orders
    .filter((o) => ["success", "paid"].includes(o.paymentStatus))
    .reduce(
      (sum, order) =>
        sum +
        (order.items || []).reduce(
          (itemSum, item) => itemSum + (item.price || 0) * (item.quantity || 0),
          0
        ),
      0
    );

  // Jumlah total order yang paid/success
  const totalOrders = orders.filter((o) =>
    ["success", "paid"].includes(o.paymentStatus)
  ).length;

  // Rata-rata order value
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Statistik ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Total Penjualan
            </CardTitle>
            <span>Rp</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalSales.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi semua pembayaran sukses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
            <span>🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Order sukses/paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Rata-rata Order
            </CardTitle>
            <span>Rp</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {avgOrderValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">/transaksi sukses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Karyawan Aktif
            </CardTitle>
            <span>
              <User></User>
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              Karyawan yang terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stok Bahan Menipis */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Bahan Menipis</CardTitle>
          <CardDescription>Bahan yang perlu segera direstok</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ingredients.filter((item) => item.stock <= item.minStock)
              .length === 0 && (
              <div className="text-gray-400 text-center">
                Stok aman semua 🎉
              </div>
            )}
            {ingredients
              .filter((item) => item.stock <= item.minStock)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Stok: {item.stock} {item.unit} (Min: {item.minStock}{" "}
                        {item.unit})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
