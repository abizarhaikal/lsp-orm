"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Receipt,
  Calculator,
  ShoppingCart,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InvoiceModal from "@/components/ui/invoiceModal";

export default function CashierDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Pastikan user role kasir, redirect jika bukan
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(userStr);
    setUsers([user]); // Simpan user ke state
    if (user.role !== "kasir") {
      window.location.href = "/login";
      return;
    }
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/order/");
      const data = await res.json();

      let orderList = data.data || data.orders || data || [];
      // Filter data undefined/null dan pastikan property penting ada
      orderList = orderList
        .filter((o) => o !== null && o !== undefined)
        .map((o) => ({
          ...o,
          id: o.id || o.order_number,
          table:
            typeof o.table === "object" && o.table !== null
              ? o.table.number || "-"
              : o.table || o.table_number || "-",
          subtotal:
            o.subtotal ??
            (o.items
              ? o.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )
              : o.total ?? 0),
          total:
            o.total ??
            (o.items
              ? o.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )
              : o.subtotal ?? 0),
          paymentStatus: o.paymentStatus || "pending", // default jika kosong
        }));

      setOrders(orderList);
    } catch (e) {
      setOrders([]);
    }
    setLoading(false);
  }

  // Fungsi warna badge status pembayaran
  const getStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "success":
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "unpaid":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Fungsi text badge status pembayaran
  const getStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case "success":
      case "paid":
        return "Sudah Bayar";
      case "pending":
      case "unpaid":
      default:
        return "Siap Bayar";
    }
  };

  // Proses pembayaran update ke backend
  const processPayment = async (orderId) => {
    try {
      await fetch(`/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: users[0]?.id, // Ambil user ID dari state
          paymentStatus: "success",
        }),
      });

      // Update status paymentStatus lokal
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, paymentStatus: "success" } : order
        )
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error("Gagal memproses pembayaran:", error);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
    }
  };

  // Filter pesanan siap bayar dan sudah bayar dengan pengecekan aman
  const readyOrders = orders.filter(
    (order) =>
      order &&
      (order.paymentStatus === "pending" ||
        !order.paymentStatus ||
        order.paymentStatus === "unpaid")
  );

  const paidOrders = orders.filter(
    (order) =>
      order &&
      (order.paymentStatus === "success" || order.paymentStatus === "paid")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Kasir Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                {readyOrders.length} Siap Bayar
              </Badge>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/login")}
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Memuat data...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pesanan Siap Bayar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Pesanan Siap Bayar ({readyOrders.length})
                </CardTitle>
                <CardDescription>
                  Pesanan yang siap untuk pembayaran
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {readyOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Tidak ada pesanan yang siap bayar
                  </p>
                )}
                {readyOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {order.order_number || order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Meja {order.table}
                          </p>
                          {order.orderTime && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {order.orderTime}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(order.paymentStatus)}>
                          {getStatusText(order.paymentStatus)}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.menu_name || item.name}
                            </span>
                            <span>
                              Rp{" "}
                              {(item.price * item.quantity).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">
                          Rp {order.subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="flex-1"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Bayar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Pembayaran -{" "}
                                {selectedOrder?.order_number ||
                                  selectedOrder?.id}
                              </DialogTitle>
                              <DialogDescription>
                                Proses pembayaran pesanan
                              </DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">
                                    Detail Pesanan:
                                  </h4>
                                  {(selectedOrder.items || []).map(
                                    (item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between text-sm"
                                      >
                                        <span>
                                          {item.quantity}x{" "}
                                          {item.menu_name || item.name}
                                        </span>
                                        <span>
                                          Rp{" "}
                                          {(
                                            item.price * item.quantity
                                          ).toLocaleString("id-ID")}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span>
                                    Rp{" "}
                                    {selectedOrder.subtotal?.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="font-medium">
                                    Metode Pembayaran:
                                  </span>
                                  <span className="text-gray-800 capitalize">
                                    {selectedOrder.paymentMethod
                                      ? selectedOrder.paymentMethod
                                      : "Cash"}
                                  </span>
                                </div>
                                <Button
                                  onClick={() =>
                                    processPayment(selectedOrder.id)
                                  }
                                  className="w-full"
                                >
                                  Proses Pembayaran
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Pesanan Sudah Bayar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-500" />
                  Pesanan Sudah Bayar ({paidOrders.length})
                </CardTitle>
                <CardDescription>
                  Pesanan yang sudah selesai dibayar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paidOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada pesanan yang dibayar
                  </p>
                )}
                {paidOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {order.order_number || order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Meja {order.table}
                          </p>
                          {order.orderTime && (
                            <p className="text-sm text-gray-600">
                              {order.orderTime}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(order.paymentStatus)}>
                          {getStatusText(order.paymentStatus)}
                        </Badge>
                      </div>
                      <div className="flex justify-between font-semibold mb-4">
                        <span>Total Dibayar:</span>
                        <span className="text-blue-600">
                          Rp {order.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <InvoiceModal order={order} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
