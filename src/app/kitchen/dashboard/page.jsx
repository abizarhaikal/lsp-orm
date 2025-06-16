"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load orders saat komponen pertama kali dimount
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "kitchen") {
      window.location.href = "/login";
      return;
    }
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order");
      if (!res.ok) throw new Error("Gagal fetch orders");
      const data = await res.json();

      // Pastikan data array
      if (!Array.isArray(data)) throw new Error("Format data tidak valid");

      setOrders(data);
    } catch (err) {
      setError("Gagal memuat pesanan. Silakan coba lagi.");
      setOrders([]);
    }
    setLoading(false);
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    setProcessing(true);
    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      await loadOrders();
    } catch (err) {
      setError("Gagal update status pesanan.");
    }
    setProcessing(false);
  }

  // Sesuaikan filter status dengan status yang ada di data contohmu
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const cookingOrders = orders.filter(
    (order) => order.status === "sedang_dimasak" || order.status === "memasak"
  ); // kalau ada status seperti ini
  const readyOrders = orders.filter(
    (order) => order.status === "selesai" || order.status === "ready"
  );

  // Styling status badge
  const getStatusColor = (status) => {
    switch (status) {
      case "dimasak":
        return "bg-yellow-100 text-yellow-800";
      case "memasak":
      case "sedang_dimasak":
        return "bg-blue-100 text-blue-800";
      case "selesai":
      case "ready":
        return "bg-green-100 text-green-800";
      case "served":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "dimasak":
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "memasak":
      case "sedang_dimasak":
        return <ChefHat className="h-4 w-4" />;
      case "selesai":
      case "ready":
        return <CheckCircle className="h-4 w-4" />;
      case "served":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "dimasak":
      case "pending":
        return "Pending";
      case "memasak":
      case "sedang_dimasak":
        return "Sedang Dimasak";
      case "selesai":
      case "ready":
        return "Siap Disajikan";
      case "served":
        return "Sudah Disajikan";
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
              <ChefHat className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Dapur - Kitchen Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {pendingOrders.length} Pesanan Baru
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  {cookingOrders.length} Sedang Dimasak
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {readyOrders.length} Siap Disajikan
                </Badge>
              </div>
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
        {loading && (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        )}
        {error && <div className="text-center text-red-500 py-2">{error}</div>}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Pesanan Aktif</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pesanan</TabsTrigger>
          </TabsList>

          {/* Pesanan Aktif */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pesanan Baru */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Pesanan Baru ({pendingOrders.length})
                  </CardTitle>
                  <CardDescription>
                    Pesanan yang perlu segera diproses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada pesanan baru
                    </p>
                  )}
                  {pendingOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">
                              {order.order_number}
                            </h3>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items &&
                            order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {item.quantity}x {item.menu_name}
                                </span>
                              </div>
                            ))}
                        </div>
                        <Button
                          disabled={processing}
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "memasak")
                          }
                          className="w-full"
                          size="sm"
                        >
                          Mulai Masak
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Sedang Dimasak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-blue-500" />
                    Sedang Dimasak ({cookingOrders.length})
                  </CardTitle>
                  <CardDescription>
                    Pesanan yang sedang dalam proses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cookingOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada pesanan yang sedang dimasak
                    </p>
                  )}
                  {cookingOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">
                              {order.order_number}
                            </h3>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                            Memasak
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items &&
                            order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {item.quantity}x {item.menu_name}
                                </span>
                              </div>
                            ))}
                        </div>
                        <Button
                          disabled={processing}
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "selesai")
                          }
                          className="w-full"
                          size="sm"
                        >
                          Selesai Masak
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Siap Disajikan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Siap Disajikan ({readyOrders.length})
                  </CardTitle>
                  <CardDescription>
                    Pesanan siap untuk diantar ke meja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {readyOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada pesanan yang siap disajikan
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
                              {order.order_number}
                            </h3>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Selesai
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items &&
                            order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {item.quantity}x {item.menu_name}
                                </span>
                              </div>
                            ))}
                        </div>
                        <Button
                          disabled={processing}
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "served")
                          }
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          Tandai Sudah Disajikan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Riwayat Pesanan */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pesanan Hari Ini</CardTitle>
                <CardDescription>
                  Semua pesanan yang telah diproses hari ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items &&
                              order.items.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  {item.quantity}x {item.menu_name}
                                </div>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
