"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  ChefHat,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const userStr =
          typeof window !== "undefined" && localStorage.getItem("user");
        if (!userStr) throw new Error("User belum login.");
        const user = JSON.parse(userStr);
        const res = await fetch(`/api/order/customer/${user.id}`);
        if (!res.ok) throw new Error("Gagal fetch orders");
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items &&
        order.items.some((item) =>
          (item.menu_name || item.name)
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        ))
  );

  // Helper untuk badge status dan pembayaran
  const getStatusBadge = (status) => {
    switch (status) {
      case "dimasak":
        return <Badge className="bg-blue-100 text-blue-800">Dimasak</Badge>;
      case "ready":
      case "selesai":
        return (
          <Badge className="bg-green-100 text-green-800">Siap Disajikan</Badge>
        );
      case "served":
        return (
          <Badge className="bg-gray-100 text-gray-800">Sudah Disajikan</Badge>
        );
      case "habis":
        return <Badge className="bg-red-100 text-red-800">Habis</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "success":
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>;
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Belum Bayar</Badge>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "dimasak":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "ready":
      case "selesai":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "served":
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case "habis":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFooterStatusText = (status, paymentStatus) => {
    if (paymentStatus !== "success" && paymentStatus !== "paid")
      return "Menunggu pembayaran";
    switch (status) {
      case "dimasak":
        return "Pesanan sedang dimasak";
      case "ready":
      case "selesai":
        return "Pesanan siap disajikan";
      case "served":
        return "Pesanan sudah disajikan";
      case "habis":
        return "Menu habis";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/customer/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Input
            placeholder="Cari pesanan berdasarkan No Order/ID atau nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="text-center text-lg py-10">Memuat pesanan...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                Semua Pesanan ({filteredOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Tidak ada pesanan yang ditemukan
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <div>
                            <CardTitle className="text-lg">
                              {order.order_number || order.id}
                            </CardTitle>
                            <p>
                              Pelanggan: {order.customer_name || "-"} <br />
                              Meja: {order.table_number ?? "-"}
                            </p>
                            <p>
                              Status: {getStatusBadge(order.status)} <br />
                              Pembayaran: {getPaymentBadge(order.paymentStatus)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {order.items && (
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.quantity}x {item.menu_name || "Item"}
                              </span>
                              <span>
                                Rp{" "}
                                {(item.price * item.quantity).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </div>
                          ))}
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>
                              Rp{" "}
                              {order.items
                                .reduce(
                                  (sum, item) =>
                                    sum + (item.price ?? 0) * item.quantity,
                                  0
                                )
                                .toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                    <CardContent className="pt-0 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>
                          {getFooterStatusText(
                            order.status,
                            order.paymentStatus
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
