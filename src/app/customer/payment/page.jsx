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

import OrderSummary from "@/components/ui/orderSummary";
import PaymentMethod from "@/components/ui/paymentMethod";

import { ArrowLeft, CheckCircle, Receipt, AlertTriangle } from "lucide-react";

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
  const [stockValidation, setStockValidation] = useState({
    isValid: true,
    message: "",
  });

  // Fungsi untuk validasi stock sebelum checkout
  const validateStock = async (items) => {
    try {
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`/api/menu/${item.id}`);
          if (!response.ok)
            throw new Error(`Gagal mengecek stock untuk ${item.name}`);
          const menuData = await response.json();
          return {
            id: item.id,
            name: item.name,
            requestedQty: item.quantity,
            availableStock: menuData.stock,
            isValid: menuData.stock >= item.quantity,
          };
        })
      );

      const invalidItems = stockChecks.filter((check) => !check.isValid);

      if (invalidItems.length > 0) {
        const errorMessage = invalidItems
          .map(
            (item) =>
              `${item.name}: diminta ${item.requestedQty}, tersedia ${item.availableStock}`
          )
          .join(", ");

        return {
          isValid: false,
          message: `Stock tidak mencukupi untuk: ${errorMessage}`,
        };
      }

      return { isValid: true, message: "" };
    } catch (error) {
      return {
        isValid: false,
        message: "Gagal memvalidasi stock. Silakan coba lagi.",
      };
    }
  };

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

        // Validasi stock saat component dimuat
        validateStock(order.items).then((validation) => {
          setStockValidation(validation);
        });
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

  // Re-validasi stock sebelum submit pembayaran
  const revalidateStock = async () => {
    const validation = await validateStock(orderDetails.items);
    setStockValidation(validation);
    return validation.isValid;
  };

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
      // Validasi stock terlebih dahulu
      const isStockValid = await revalidateStock();
      if (!isStockValid) {
        setError(stockValidation.message);
        setIsProcessing(false);
        return;
      }

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
          paymentMethod,
          items: orderDetails.items.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
          table_id: tableId || null,
          total,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal melakukan pembayaran.");
      }

      // Jika berhasil, tampilkan success dialog
      setShowSuccess(true);

      // Hapus currentOrder dari localStorage
      localStorage.removeItem("currentOrder");

      // Reset stock validation
      setStockValidation({ isValid: true, message: "" });
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Gagal melakukan pembayaran.");

      // Re-validasi stock jika terjadi error untuk update status
      await revalidateStock();
    }
    setIsProcessing(false);
  };

  const handleBackToMenu = () => {
    router.push("/customer/dashboard");
  };

  const handleUpdateOrder = () => {
    // Kembali ke menu untuk update pesanan
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
        {/* Alert untuk validasi stock */}
        {!stockValidation.isValid && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">
                  Peringatan Stock
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {stockValidation.message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleUpdateOrder}
                >
                  Update Pesanan
                </Button>
              </div>
            </div>
          </div>
        )}

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
              disabled={!stockValidation.isValid} // Disable payment jika stock tidak valid
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
              diproses dan stock menu telah diperbarui.
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
