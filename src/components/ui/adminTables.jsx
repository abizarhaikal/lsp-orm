"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table as UiTable,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Edit } from "lucide-react";

function getStatusColor(status) {
  switch (status) {
    case "Tersedia":
      return "bg-green-100 text-green-800";
    case "Terisi":
      return "bg-red-100 text-red-800";
    case "Reservasi":
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    case "Maintenance":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    number: "",
    capacity: "",
    status: "Tersedia",
  });

  // === State Edit Reservasi ===
  const [editReservation, setEditReservation] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTableId, setEditTableId] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Fetch tables
  useEffect(() => {
    async function fetchTables() {
      const res = await fetch("/api/table");
      const data = await res.json();
      setTables(Array.isArray(data) ? data : []);
    }
    fetchTables();
  }, []);

  // Fetch reservations
  const fetchReservations = async () => {
    const res = await fetch("/api/reservation");
    const data = await res.json();
    setReservations(Array.isArray(data) ? data : []);
  };
  useEffect(() => {
    fetchReservations();
  }, []);

  // Add new table
  const handleAddTable = async () => {
    if (!newTable.number || !newTable.capacity) return;
    const res = await fetch("/api/table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: Number(newTable.number),
        capacity: Number(newTable.capacity),
        status: "Tersedia",
      }),
    });
    const data = await res.json();
    if (res.ok) setTables((prev) => [...prev, data]);
    setNewTable({ number: "", capacity: "", status: "Tersedia" });
    setIsDialogOpen(false);
  };

  // Open edit reservation modal
  const openEditReservation = (reservation) => {
    setEditReservation(reservation);
    setEditTableId(reservation.table_id || "");
    setEditStatus(reservation.status || "");
    setEditOpen(true);
  };

  // Save edit reservation
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editReservation) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/reservation/${editReservation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: editReservation.customer_id,
          table_id: editTableId || null,
          guest_count: editReservation.guest_count,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update gagal");
      await fetchReservations();
      setEditOpen(false);
    } catch (err) {
      alert("Gagal update: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Card 1: Table management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manajemen Meja</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Tambah Meja</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Meja Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan detail meja baru
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="tableNumber"
                      className="block text-sm font-medium"
                    >
                      Nomor Meja
                    </label>
                    <Input
                      id="tableNumber"
                      type="number"
                      value={newTable.number}
                      onChange={(e) =>
                        setNewTable({ ...newTable, number: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tableCapacity"
                      className="block text-sm font-medium"
                    >
                      Kapasitas
                    </label>
                    <Input
                      id="tableCapacity"
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) =>
                        setNewTable({ ...newTable, capacity: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleAddTable} className="w-full">
                    Simpan Meja
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <UiTable>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell>{table.number}</TableCell>
                  <TableCell>{table.capacity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Tambah tombol Edit Meja jika perlu */}
                    <Button size="sm" variant="outline" disabled>
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UiTable>
        </CardContent>
      </Card>

      {/* Card 2: Reservations list */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Reservasi</CardTitle>
        </CardHeader>
        <CardContent>
          <UiTable>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>No Meja</TableHead>
                <TableHead>Nama Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length > 0 ? (
                reservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {r.reservation_date?.slice(0, 10) || "-"}
                    </TableCell>
                    <TableCell>{r.table?.number ?? "-"}</TableCell>
                    <TableCell>{r.customer_name || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(r.status)}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditReservation(r)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    Tidak ada reservasi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </UiTable>
        </CardContent>
      </Card>

      {/* Edit Reservation Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reservasi</DialogTitle>
            <DialogDescription>
              Ubah nomor meja atau status reservasi.
            </DialogDescription>
          </DialogHeader>
          {editReservation && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nomor Meja
                </label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={editTableId}
                  onChange={(e) => setEditTableId(e.target.value)}
                >
                  <option value="">-- Pilih Meja --</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Meja {table.number} (Kapasitas: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="canceled">Canceled</option>
                  <option value="Reservasi">Reservasi</option>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Terisi">Terisi</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={editLoading}>
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
