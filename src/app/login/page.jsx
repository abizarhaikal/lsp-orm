"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, CreditCard, ShoppingCart, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("customer"); // default: customer
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const roles = [
    {
      value: "customer",
      label: "Pelanggan",
      icon: Users,
      color: "bg-blue-500",
    },
    { value: "admin", label: "Admin", icon: ShoppingCart, color: "bg-red-500" },
    {
      value: "kitchen",
      label: "Staff Dapur",
      icon: ChefHat,
      color: "bg-green-500",
    },
    {
      value: "kasir",
      label: "Kasir",
      icon: CreditCard,
      color: "bg-purple-500",
    },
  ];

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Kirim login langsung ke Next.js API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          role: selectedRole, // Kirim role sesuai pilihan user
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan user info (opsional, tergantung kebutuhan)
        localStorage.setItem(
          "user",
          JSON.stringify({ ...data, role: selectedRole })
        );
        // Redirect ke dashboard sesuai role
        router.push(`/${selectedRole}/dashboard`);
      } else {
        alert(data.error || "Login gagal, silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat login.");
    }
    setLoading(false);
  };

  // Redirect ke halaman register
  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Restoran Nusantara
          </CardTitle>
          <CardDescription>Sistem Manajemen Restoran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Pilih Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih role Anda" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={
              loading ||
              !selectedRole ||
              !credentials.email ||
              !credentials.password
            }
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          {/* Tombol Register */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRegister}
            type="button"
          >
            Register
          </Button>

          {selectedRole && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Login sebagai:{" "}
                <span className="font-semibold">
                  {roles.find((r) => r.value === selectedRole)?.label}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
