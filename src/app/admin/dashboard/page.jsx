"use client";
import AdminEmployees from "@/components/ui/adminEmployees";
import AdminMenu from "@/components/ui/adminMenu";
import AdminOverview from "@/components/ui/adminOverview";
import AdminReports from "@/components/ui/adminReports";
import AdminTables from "@/components/ui/adminTables";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Data dummy untuk menu, employees, tables, ingredients
  // ... (tidak diubah, sama dengan punyamu di atas)
  const [ingredients, setIngredients] = useState([]);
  const [users, setUsers] = useState([]);
  const [addUser, setAddUser] = useState(() => () => {});
  const [menuItems, setMenuItems] = useState([]);
  const [addMenuItem, setAddMenuItem] = useState(() => () => {});
  const [employees, setEmployees] = useState([]);
  const [addEmployee, setAddEmployee] = useState(() => () => {});
  const [tables, setTables] = useState([
    {
      id: 1,
      number: 1,
      capacity: 4,
      status: "Tersedia",
      location: "Indoor",
      qrCode: "QR001",
    },
    {
      id: 2,
      number: 2,
      capacity: 2,
      status: "Terisi",
      location: "Indoor",
      qrCode: "QR002",
    },
    {
      id: 3,
      number: 3,
      capacity: 6,
      status: "Reservasi",
      location: "Outdoor",
      qrCode: "QR003",
    },
    {
      id: 4,
      number: 4,
      capacity: 4,
      status: "Tersedia",
      location: "Indoor",
      qrCode: "QR004",
    },
    {
      id: 5,
      number: 5,
      capacity: 8,
      status: "Maintenance",
      location: "Outdoor",
      qrCode: "QR005",
    },
  ]);

  const [addTable, setAddTable] = useState(() => () => {});
  const [addIngredient, setAddIngredient] = useState(() => () => {});
  const [autoRestock, setAutoRestock] = useState(() => () => {});
  const [activityLogs, setActivityLogs] = useState([]);
  // Tambahkan state orders dan totalSales
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  // fetch data user
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/user/");
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        setUsers([]);
      }
    }
    fetchUsers();
  }, []);
  useEffect(() => {
    // Fetch semua order
    async function fetchOrders() {
      try {
        const res = await fetch("/api/order/");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setOrders([]);
      }
    }
    // Fetch total sales
    async function fetchTotalSales() {
      try {
        const res = await fetch("/api/order/total-sales");
        const data = await res.json();
        setTotalSales(data.totalSales || 0);
      } catch {
        setTotalSales(0);
      }
    }
    fetchOrders();
    fetchTotalSales();
  }, []);
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/activity-log");
        const data = await res.json();
        setActivityLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        setActivityLogs([]);
      }
    }
    fetchLogs();
  }, []);

  // ...handlers autoRestock, addMenuItem, addEmployee, addTable, addIngredient

  const staffRoles = ["admin", "kitchen", "kasir"];
  const staff = users.filter((user) => staffRoles.includes(user.role));
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="employees">Karyawan</TabsTrigger>
            <TabsTrigger value="tables">Meja</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <AdminOverview
              totalSales={totalSales}
              orders={orders}
              ingredients={ingredients}
              staff={staff}
              // Tambahkan autoRestock jika mau pakai
            />
          </TabsContent>
          {/* Menu */}
          <TabsContent value="menu">
            <AdminMenu
              menuItems={menuItems}
              addMenuItem={addMenuItem}
              setMenuItems={setMenuItems}
            />
          </TabsContent>
          {/* Karyawan */}
          <TabsContent value="employees">
            <AdminEmployees
              employees={staff}
              addEmployee={addEmployee}
              setEmployees={setEmployees}
            />
          </TabsContent>
          {/* Meja */}
          <TabsContent value="tables">
            <AdminTables
              tables={tables}
              addTable={addTable}
              setTables={setTables}
            />
          </TabsContent>

          {/* Laporan */}
          <TabsContent value="reports">
            <AdminReports
              salesData={{ totalSales, orderCount: orders.length }}
              orders={orders}
              activityLogs={activityLogs}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
