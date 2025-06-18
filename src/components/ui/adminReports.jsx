"use client";
import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Printer, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper: Rekap per hari
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
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, total]) => ({
      date,
      total,
    }));
}

// Helper: Rekap per tanggal (hanya angka tanggal)
function groupOrdersByDate(orders) {
  if (!orders || !orders.length) return [];
  const map = {};
  orders.forEach((order) => {
    if (!order.created_at || order.paymentStatus !== "success") return;
    const date = new Date(order.created_at);
    const dateNumber = date.getDate();
    map[dateNumber] =
      (map[dateNumber] || 0) +
      (order.items?.reduce?.(
        (a, i) => a + (i.price || 0) * (i.quantity || 1),
        0
      ) || 0);
  });
  return Object.entries(map)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([date, total]) => ({
      date: parseInt(date),
      total,
    }));
}

// Helper: Rekap per minggu (Minggu dimulai Senin)
function groupOrdersByWeek(orders) {
  if (!orders || !orders.length) return [];
  const weeks = {};
  orders.forEach((order) => {
    if (!order.created_at || order.paymentStatus !== "success") return;
    const date = new Date(order.created_at);
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const weekStr = monday.toISOString().slice(0, 10);
    weeks[weekStr] =
      (weeks[weekStr] || 0) +
      (order.items?.reduce?.(
        (a, i) => a + (i.price || 0) * (i.quantity || 1),
        0
      ) || 0);
  });
  return Object.entries(weeks)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([weekStart, total]) => ({
      weekStart,
      total,
    }));
}

// Helper: Format tanggal
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Helper: Format minggu
function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startStr = start.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
  const endStr = end.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

export default function AdminReports({ salesData, orders = [], activityLogs }) {
  const reportRef = useRef();
  const [range, setRange] = useState("day");

  const salesPerDay = groupOrdersByDay(orders);
  const salesPerDate = groupOrdersByDate(orders);
  const salesPerWeek = groupOrdersByWeek(orders);

  let rekapData = [];
  let chartData = [];

  switch (range) {
    case "day":
      rekapData = salesPerDay;
      chartData = salesPerDay.map((d) => ({
        date: d.date,
        total: d.total,
      }));
      break;
    case "date":
      rekapData = salesPerDate;
      chartData = salesPerDate.map((d) => ({
        date: `${d.date}`,
        total: d.total,
      }));
      break;
    case "week":
      rekapData = salesPerWeek;
      chartData = salesPerWeek.map((d) => ({
        date: d.weekStart,
        total: d.total,
      }));
      break;
    default:
      rekapData = salesPerDay;
      chartData = salesPerDay.map((d) => ({
        date: d.date,
        total: d.total,
      }));
  }

  console.log("Chart Data:", chartData); // Debug log

  // Calculate totals
  const totalSales = rekapData.reduce((sum, item) => sum + item.total, 0);
  const averageSales = rekapData.length > 0 ? totalSales / rekapData.length : 0;
  const highestSales =
    rekapData.length > 0 ? Math.max(...rekapData.map((item) => item.total)) : 0;

  const handlePrint = () => window.print();

  const getRangeTitle = () => {
    switch (range) {
      case "day":
        return "Per Hari Lengkap";
      case "date":
        return "Per Tanggal";
      case "week":
        return "Per Minggu";
      default:
        return "Per Hari";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Laporan Penjualan & Aktivitas
            </CardTitle>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
        </CardHeader>

        <CardContent className="space-y-6" ref={reportRef}>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Tampilkan:</label>
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Per Hari Lengkap</SelectItem>
                <SelectItem value="date">Per Tanggal (1-31)</SelectItem>
                <SelectItem value="week">Per Minggu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Penjualan
                  </h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  Rp {totalSales.toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Rata-rata
                  </h3>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  Rp {Math.round(averageSales).toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Tertinggi
                  </h3>
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  Rp {highestSales.toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Sales Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Rekap Penjualan {getRangeTitle()}
            </h2>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {range === "day"
                          ? "Tanggal"
                          : range === "date"
                          ? "Tanggal"
                          : "Periode Minggu"}
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Total Penjualan
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.length > 0 ? (
                      rekapData.map((item, index) => {
                        const percentage =
                          totalSales > 0 ? (item.total / totalSales) * 100 : 0;
                        const isHighest = item.total === highestSales;

                        return (
                          <tr
                            key={
                              range === "day"
                                ? item.date
                                : range === "date"
                                ? item.date
                                : item.weekStart
                            }
                            className={`border-b transition-colors hover:bg-muted/50 ${
                              isHighest ? "bg-green-50" : ""
                            }`}
                          >
                            <td className="p-4 align-middle">
                              <div className="flex items-center space-x-2">
                                {isHighest && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Top
                                  </Badge>
                                )}
                                <span className="font-medium">
                                  {range === "day"
                                    ? formatDate(item.date)
                                    : range === "date"
                                    ? `Tanggal ${item.date}`
                                    : formatWeekRange(item.weekStart)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle text-right">
                              <span className="font-semibold text-green-700">
                                Rp {item.total.toLocaleString("id-ID")}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-16 bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground min-w-[40px]">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Tidak ada data penjualan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sales Chart */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Grafik Penjualan {getRangeTitle()}
            </h2>

            <Card>
              <CardContent className="p-6">
                {chartData && chartData.length > 0 ? (
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickFormatter={(v) => {
                            if (range === "date") return v;
                            if (range === "week") return formatDate(v);
                            return formatDate(v);
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis
                          tickFormatter={(v) => {
                            if (v >= 1000000)
                              return "Rp" + (v / 1000000).toFixed(1) + "M";
                            if (v >= 1000)
                              return "Rp" + (v / 1000).toFixed(0) + "k";
                            return "Rp" + v;
                          }}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            "Rp " + value.toLocaleString("id-ID"),
                            "Penjualan",
                          ]}
                          labelFormatter={(label) => {
                            if (range === "date") return `Tanggal ${label}`;
                            if (range === "week")
                              return `Minggu: ${formatDate(label)}`;
                            return formatDate(label);
                          }}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: "#1d4ed8", strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Tidak ada data untuk ditampilkan
                    </p>
                    <p className="text-sm">
                      Grafik akan muncul setelah ada data penjualan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Activity Log */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Log Aktivitas</h2>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Waktu
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Aksi
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Target
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs && activityLogs.length > 0 ? (
                      activityLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.createdAt)}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="space-y-1">
                              <span className="font-medium">
                                {log.user_name || "-"}
                              </span>
                              <div>
                                <Badge variant="outline" className="text-xs">
                                  {log.user_role || log.user?.role || "-"}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant="secondary" className="capitalize">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="text-sm">{log.target}</span>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="text-sm text-muted-foreground">
                              {log.message}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Tidak ada log aktivitas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
