"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CardMenu from "@/components/ui/cardMenu";
import Cart from "@/components/ui/cart";
import ReservationForm from "@/components/ui/reservationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notebook, Receipt, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  // States
  const [user, setUser] = useState(null);
  const [checkedUser, setCheckedUser] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const router = useRouter();

  // Ambil data user dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (!u || JSON.parse(u).role !== "customer") {
        // Jika user tidak ada atau bukan customer, redirect ke login
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      setUser(JSON.parse(u));
      setCheckedUser(true);
    }
  }, []);

  // Fetch menu dari API internal Next.js
  useEffect(() => {
    async function getMenu() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Gagal fetch menu");
        const menu = await res.json();
        setMenuItems(menu);
      } catch (err) {
        setError("Gagal memuat menu: " + err.message);
      }
      setLoading(false);
    }
    getMenu();
  }, []);

  if (!checkedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">Memeriksa login...</span>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
          <p className="mt-2 text-gray-600">
            Silakan masuk sebagai pelanggan terlebih dahulu.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.replace("/login")}
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  // Handler keranjang
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Handle checkout (masih simpan order di localStorage, bukan ke API)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }

    setCheckoutLoading(true);

    const orderData = {
      id: "ORD-" + Date.now(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: getTotalPrice(),
      total: Math.round(getTotalPrice() * 1.1 + 5000),
      status: "pending",
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
    localStorage.setItem("currentOrder", JSON.stringify(orderData));
    setCheckoutLoading(false);
    router.push("/customer/payment");
  };

  const goToOrders = () => {
    router.push("/customer/orders");
  };

  const goToReservations = () => {
    router.push("/customer/reservations");
  };

  // Handle reservation submission
  const handleReservationSubmit = async (data) => {
    setReservationLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};

      // Format data sesuai dengan yang diharapkan API
      const reservationData = {
        customer_id: data.customer_id,
        guest_count: Number(data.guest_count),
        reservation_date: data.reservation_date, // sudah string
        reservation_time: data.reservation_time,
        table_id: data.table_id || null,
        status: "pending",
      };

      console.log("Sending reservation data:", reservationData);

      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal membuat reservasi");
      }

      alert("Reservasi berhasil dibuat!");
      console.log("Reservation created:", responseData);
    } catch (error) {
      console.error("Error membuat reservasi:", error);
      alert(`Gagal membuat reservasi: ${error.message}`);
    } finally {
      setReservationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Restoran Nusantara
            </h1>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-1 px-3 py-1 rounded text-gray-700 border hover:bg-gray-100 transition"
                title="Pesanan Saya"
                onClick={goToOrders}
              >
                <Receipt className="h-5 w-5" />
                <span className="hidden sm:inline">Pesanan Saya</span>
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded text-gray-700 border hover:bg-gray-100 transition"
                title="Reservations"
                onClick={goToReservations}
              >
                <Notebook className="h-5 w-5" />
                <span className="hidden sm:inline">Reservations</span>
              </button>

              <Badge variant="secondary" className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                {cart.length} item
              </Badge>
              <button
                className="border px-3 py-1 rounded text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  localStorage.removeItem("user");
                  router.replace("/login");
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Pemesanan Menu</TabsTrigger>
            <TabsTrigger value="reservation">Reservasi Meja</TabsTrigger>
          </TabsList>

          {/* MENU TAB */}
          <TabsContent value="menu" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Menu Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Restoran</CardTitle>
                    <CardDescription>Pilih menu favorit Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div>Loading menu...</div>
                    ) : error ? (
                      <div className="text-red-500">{error}</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {menuItems.map((item) => (
                          <CardMenu
                            key={item.id}
                            item={item}
                            onAdd={addToCart}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Keranjang Belanja */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Keranjang Belanja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Pilih Nomor Meja
                      </label>
                    </div>
                    <Cart
                      cart={cart}
                      onMinus={(item) =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      onPlus={(item) =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      total={getTotalPrice()}
                      onCheckout={handleCheckout}
                      checkoutLoading={checkoutLoading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* RESERVASI TAB */}
          <TabsContent value="reservation">
            <Card>
              <CardHeader>
                <CardTitle>Reservasi Meja</CardTitle>
                <CardDescription>
                  Pesan meja untuk pengalaman dining yang lebih nyaman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ReservationForm
                  onSubmit={handleReservationSubmit}
                  loading={reservationLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
