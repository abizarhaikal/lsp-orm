"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, Table2, Clock1 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ReservationForm({ onSubmit, tables = [] }) {
  const [selectedDate, setSelectedDate] = useState();
  const [form, setForm] = useState({
    customer_id: "",
    guest_count: "",
    reservation_time: "",
    table_id: "none", // default: none
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log("💾 User from localStorage:", user);
          setForm((prev) => ({
            ...prev,
            customer_id: user.id || "",
          }));
        } catch (e) {
          console.error("❌ Error parsing user from localStorage:", e);
        }
      }
    }
  }, []);

  const handleChange = (key, value) => {
    console.log(`🔄 Form field changed: ${key} = ${value}`);
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateSelect = (date) => {
    console.log("📅 Date selected:", date);
    setSelectedDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debugging - log semua nilai sebelum submit
    console.log("📋 Form state before submit:", form);
    console.log("📅 Selected date before submit:", selectedDate);

    // Validation
    const errors = [];
    if (!form.customer_id) errors.push("customer_id kosong");
    if (!selectedDate) errors.push("tanggal belum dipilih");
    if (!form.guest_count) errors.push("jumlah tamu belum dipilih");
    if (!form.reservation_time) errors.push("waktu belum dipilih");

    if (errors.length > 0) {
      console.error("❌ Validation errors:", errors);
      alert("Mohon lengkapi: " + errors.join(", "));
      return;
    }

    try {
      // Pastikan reservation_date dalam format yang benar
      const reservationData = {
        customer_id: form.customer_id,
        guest_count: parseInt(form.guest_count, 10),
        reservation_date: selectedDate
          ? selectedDate.toISOString().slice(0, 10)
          : "",
        reservation_time: form.reservation_time,
        table_id: form.table_id !== "none" ? form.table_id : null,
      };

      // Debugging - log data yang akan dikirim
      console.log("📤 Sending reservation data:", reservationData);

      // Validate data one more time
      if (
        !reservationData.customer_id ||
        !reservationData.guest_count ||
        !reservationData.reservation_date ||
        !reservationData.reservation_time
      ) {
        console.error("❌ Final validation failed:", reservationData);
        alert("Ada kesalahan dalam data form. Silakan coba lagi.");
        return;
      }

      await onSubmit(reservationData);

      // Reset form hanya jika submit berhasil
      setForm({
        customer_id: form.customer_id, // keep customer_id
        guest_count: "",
        reservation_time: "",
        table_id: "none",
      });
      setSelectedDate(undefined);

      console.log("✅ Form reset after successful submit");
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert("Terjadi kesalahan saat membuat reservasi. Silakan coba lagi.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Buat Reservasi</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Debug info */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p>
                <strong>Customer ID:</strong> {form.customer_id || "Belum ada"}
              </p>
              <p>
                <strong>Guest Count:</strong>{" "}
                {form.guest_count || "Belum dipilih"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedDate
                  ? format(selectedDate, "PPP", { locale: id })
                  : "Belum dipilih"}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {form.reservation_time || "Belum dipilih"}
              </p>
              <p>
                <strong>Table:</strong>{" "}
                {form.table_id !== "none" ? form.table_id : "Tidak dipilih"}
              </p>
            </div>

            {/* Jumlah tamu */}
            <div className="space-y-2">
              <Label htmlFor="guests">Jumlah Tamu *</Label>
              <Select
                value={form.guest_count}
                onValueChange={(val) => handleChange("guest_count", val)}
              >
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih jumlah tamu" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {num} orang
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pilih meja */}
            <div className="space-y-2">
              <Label htmlFor="table_id">Meja (Opsional)</Label>
              <Select
                value={form.table_id}
                onValueChange={(val) => handleChange("table_id", val)}
              >
                <SelectTrigger>
                  <Table2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih meja (bisa dikosongkan)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak Pilih Meja</SelectItem>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Meja {table.number} ({table.capacity} orang)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {/* Tanggal reservasi */}
            <div className="space-y-2">
              <Label>Tanggal Reservasi *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`border w-full py-2 px-3 rounded flex items-center gap-2 text-left font-normal bg-white hover:bg-gray-50 ${
                      !selectedDate ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: id })
                      : "Pilih tanggal"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Jam */}
            <div className="space-y-2">
              <Label htmlFor="reservation_time">Waktu *</Label>
              <Select
                value={form.reservation_time}
                onValueChange={(val) => handleChange("reservation_time", val)}
              >
                <SelectTrigger>
                  <Clock1 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih waktu" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00",
                  ].map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !selectedDate ||
            !form.customer_id ||
            !form.guest_count ||
            !form.reservation_time
          }
        >
          {!selectedDate ||
          !form.customer_id ||
          !form.guest_count ||
          !form.reservation_time
            ? "Lengkapi form terlebih dahulu"
            : "Buat Reservasi"}
        </button>
      </form>
    </div>
  );
}
