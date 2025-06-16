"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, Calendar, Users, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function CustomerReservationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reservations by current user (internal API)
  useEffect(() => {
    async function loadReservations() {
      setLoading(true);
      setError(null);
      try {
        const userStr =
          typeof window !== "undefined" && localStorage.getItem("user");
        if (!userStr) throw new Error("User belum login.");
        const user = JSON.parse(userStr);
        const customerId = user.id;
        // --- fetch from internal API ---
        const res = await fetch(`/api/reservation/customer/${customerId}`);
        if (!res.ok) throw new Error("Gagal fetch reservasi");
        const data = await res.json();
        setReservations(data || []);
      } catch (err) {
        setError(err.message);
        setReservations([]);
      }
      setLoading(false);
    }
    loadReservations();
  }, []);

  // Filter logic
  const filteredReservations = reservations.filter(
    (rsv) =>
      rsv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rsv.status &&
        rsv.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Tab groupings
  const pending = filteredReservations.filter(
    (r) => r.status?.toLowerCase() === "pending"
  );
  const confirmed = filteredReservations.filter(
    (r) => r.status?.toLowerCase() === "confirmed"
  );
  const completed = filteredReservations.filter(
    (r) => r.status?.toLowerCase() === "completed"
  );
  const cancelled = filteredReservations.filter(
    (r) => r.status?.toLowerCase() === "cancelled"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="bg-transparent border-none"
                onClick={() => router.push("/customer/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Reservasi Saya
              </h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Cari Reservasi
          </Label>
          <Input
            id="search"
            placeholder="Cari berdasarkan ID atau status reservasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        {loading ? (
          <div className="text-center text-lg py-10">Memuat reservasi...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                Menunggu ACC ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Sudah Di-ACC ({confirmed.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Selesai ({completed.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Dibatalkan ({cancelled.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Semua Reservasi ({filteredReservations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pending.length === 0 ? (
                <EmptyReservation text="Tidak ada reservasi menunggu ACC." />
              ) : (
                pending.map((rsv) => (
                  <ReservationCard key={rsv.id} reservation={rsv} />
                ))
              )}
            </TabsContent>
            <TabsContent value="confirmed" className="space-y-4">
              {confirmed.length === 0 ? (
                <EmptyReservation text="Tidak ada reservasi yang sudah di-ACC." />
              ) : (
                confirmed.map((rsv) => (
                  <ReservationCard key={rsv.id} reservation={rsv} />
                ))
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              {completed.length === 0 ? (
                <EmptyReservation text="Tidak ada reservasi selesai." />
              ) : (
                completed.map((rsv) => (
                  <ReservationCard key={rsv.id} reservation={rsv} />
                ))
              )}
            </TabsContent>
            <TabsContent value="cancelled" className="space-y-4">
              {cancelled.length === 0 ? (
                <EmptyReservation text="Tidak ada reservasi dibatalkan." />
              ) : (
                cancelled.map((rsv) => (
                  <ReservationCard key={rsv.id} reservation={rsv} />
                ))
              )}
            </TabsContent>
            <TabsContent value="all" className="space-y-4">
              {filteredReservations.length === 0 ? (
                <EmptyReservation text="Tidak ada reservasi yang ditemukan." />
              ) : (
                filteredReservations.map((rsv) => (
                  <ReservationCard key={rsv.id} reservation={rsv} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function EmptyReservation({ text }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">{text}</p>
      </CardContent>
    </Card>
  );
}

// Komponen kartu satu reservasi
function ReservationCard({ reservation }) {
  const tanggal =
    reservation.reservation_date &&
    format(new Date(reservation.reservation_date), "PPP", { locale: id });
  const jam = reservation.reservation_time?.slice(0, 5);

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Menunggu ACC</Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800">Sudah Di-ACC</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Ambil data table jika ada
  const tableNumber =
    reservation.table?.number || reservation.table_number || "-";
  const tableCapacity =
    reservation.table?.capacity !== undefined
      ? reservation.table.capacity
      : undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle className="text-lg">
                {reservation.id?.slice(0, 8) ?? "Reservasi"}
              </CardTitle>
              <CardDescription>
                Tanggal: <b>{tanggal}</b>
                <br />
                Jam: <b>{jam || "-"}</b>
                <br />
                Jumlah Tamu: <Users className="inline h-4 w-4 mr-1" />
                {reservation.guest_count}
                <br />
                Meja:{" "}
                <span>
                  <Table2 className="inline h-4 w-4 mr-1" />
                  <b>
                    {tableNumber}
                    {tableCapacity ? ` (${tableCapacity} orang)` : ""}
                  </b>
                </span>
                <br />
                Status: {getStatusBadge(reservation.status)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
