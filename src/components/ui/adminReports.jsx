"use client";
import { useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper: Group order by day & total sales per day
function groupOrdersByDay(orders) {
  if (!orders || !orders.length) return [];
  const map = {};
  orders.forEach((order) => {
    if (!order.created_at || order.paymentStatus !== "success") return;
    const day = new Date(order.created_at).toISOString().slice(0, 10);
    map[day] =
      (map[day] || 0) +
      (order.items?.reduce?.(
        (a, i) => a + (i.price || 0) * (i.quantity || 1),
        0
      ) || 0);
  });
  return Object.entries(map).map(([date, total]) => ({
    date,
    total,
  }));
}
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminReports({ salesData, orders = [], activityLogs }) {
  const reportRef = useRef();

  const salesPerDay = groupOrdersByDay(orders);

  // Handler cetak
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between print-hide">
        <CardTitle>Laporan Penjualan & Aktivitas</CardTitle>
        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded ml-auto print-hide"
        >
          Cetak / Print
        </button>
      </CardHeader>
      {/* Bagian yang akan di-print */}
      <CardContent className="space-y-8 print-area" ref={reportRef}>
        {/* Section Laporan Penjualan */}
        <div>
          <h2 className="font-semibold mb-2 text-lg">Laporan Penjualan</h2>
          <div className="flex gap-6 flex-wrap mb-4">
            <div>
              <div className="text-xs text-gray-500">Total Penjualan</div>
              <div className="font-bold text-xl text-green-600">
                Rp {(salesData?.totalSales || 0).toLocaleString("id-ID")}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Order</div>
              <div className="font-bold text-xl">
                {salesData?.orderCount ?? "-"}
              </div>
            </div>
          </div>
          {/* Grafik Penjualan per Hari */}
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesPerDay}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => "Rp" + v.toLocaleString("id-ID")}
                />
                <Tooltip formatter={(v) => "Rp" + v.toLocaleString("id-ID")} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Log Aktivitas */}
        <div>
          <h2 className="font-semibold mb-2 text-lg">Log Aktivitas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">Waktu</th>
                  <th className="py-2 px-3 text-left">User</th>
                  <th className="py-2 px-3 text-left">Aksi</th>
                  <th className="py-2 px-3 text-left">Target</th>
                  <th className="py-2 px-3 text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs && activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-none">
                      <td className="py-1 px-3">{formatDate(log.createdAt)}</td>
                      <td className="py-1 px-3">
                        {log.user_name || "-"}
                        <span className="text-xs text-gray-400 ml-1">
                          ({log.user_role || log.user?.role || "-"})
                        </span>
                      </td>
                      <td className="py-1 px-3 capitalize">{log.action}</td>
                      <td className="py-1 px-3">{log.target}</td>
                      <td className="py-1 px-3">{log.message}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-gray-400">
                      Tidak ada log aktivitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
      {/* Optionally, bisa tambahkan copyright/created by di print-area */}
    </Card>
  );
}
