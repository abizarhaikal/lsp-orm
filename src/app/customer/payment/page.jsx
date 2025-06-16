"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import OrderSummary from "@/components/ui/orderSummary"; // Pastikan file ini ada
import PaymentMethod from "@/components/ui/paymentMethod"; // Pastikan file ini ada

import { ArrowLeft, CheckCircle, Receipt } from "lucide-react";

// Fungsi hitung total harga
function calculateOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export default function PaymentPage() {
  const router = useRouter();

  // State utama
  const [user, setUser] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [tableId, setTableId] = useState("");
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  // Ambil user, order, dan daftar meja dari localStorage dan API
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ambil user dan order dari localStorage
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);

      const stored = localStorage.getItem("currentOrder");
      if (stored) {
        const order = JSON.parse(stored);
        setOrderDetails(order);
        setTableId(order.table?.id || "");
      }

      // Fetch data meja dari API
      async function fetchTables() {
        try {
          const res = await fetch("/api/table");
          if (!res.ok) throw new Error("Gagal mengambil data meja");
          const data = await res.json();
          setTables(data);
        } catch (err) {
          console.error("Error fetch tables:", err.message);
        }
      }
      fetchTables();
    }
  }, []);

  if (!orderDetails || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">Memuat data pesanan...</span>
      </div>
    );
  }

  // Submit pembayaran
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");
    try {
      const total = calculateOrderTotal(orderDetails.items);
      const isCash = paymentMethod === "cash";
      const paymentStatus = isCash ? "pending" : "success";

      const res = await fetch("/api/order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          status: "pending",
          paymentStatus,
          items: orderDetails.items.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
          table_id: tableId || null,
          total,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal melakukan pembayaran.");
      }

      setShowSuccess(true);
      localStorage.removeItem("currentOrder");
    } catch (err) {
      setError(err.message || "Gagal melakukan pembayaran.");
    }
    setIsProcessing(false);
  };

  const handleBackToMenu = () => {
    router.push("/customer/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBackToMenu}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              {orderDetails.id || orderDetails.order_number}
            </Badge>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelanggan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" value={user.name || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="table_id">Pilih Meja</Label>
                  <select
                    id="table_id"
                    className="w-full border rounded px-2 py-1"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                  >
                    <option value="">-- Tidak pilih meja --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Meja {table.number} (Kapasitas: {table.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <OrderSummary orderDetails={orderDetails} />

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mt-2">
                {error}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
              isProcessing={isProcessing}
              handlePaymentSubmit={handlePaymentSubmit}
            />
          </div>
        </div>
      </main>

      {/* Dialog sukses */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Pembayaran Berhasil
            </DialogTitle>
            <DialogDescription>
              Pembayaran untuk pesanan{" "}
              {orderDetails.id || orderDetails.order_number} telah berhasil
              diproses
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="font-bold text-green-800">Terima Kasih!</h3>
              <p className="text-sm text-green-700">
                Pesanan Anda sedang diproses dan akan segera disajikan.
              </p>
              {paymentMethod === "cash" && (
                <p className="text-xs text-gray-600">
                  Silakan tunjukkan pesanan ini ke kasir dan lakukan pembayaran
                  tunai.
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowSuccess(false);
                router.push(`/customer/orders`);
              }}
            >
              Lihat Status Pesanan
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowSuccess(false);
                router.push("/customer/dashboard");
              }}
            >
              Kembali ke Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
