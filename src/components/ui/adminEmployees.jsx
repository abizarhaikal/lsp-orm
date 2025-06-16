"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Eye, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Trash2, Save, X } from "lucide-react";

// Helper role icon
function getRoleIcon(role) {
  return <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />;
}

export default function AdminEmployees({ employees, setEmployees }) {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Untuk edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "", email: "" });

  // Add Employee handler (sama seperti sebelumnya)
  const addEmployee = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          password: newEmployee.password || "password123",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah karyawan");
      setEmployees((prev) => [...prev, data]);
      setIsAddEmployeeOpen(false);
      setNewEmployee({ name: "", role: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Employee
  const startEdit = (employee) => {
    setEditId(employee.id);
    setEditData({
      name: employee.name,
      role: employee.role,
      email: employee.email,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({ name: "", role: "", email: "" });
  };

  const saveEdit = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update karyawan");

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, ...editData } : emp))
      );
      setEditId(null);
      setEditData({ name: "", role: "", email: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    if (!window.confirm("Yakin ingin hapus karyawan ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus karyawan");

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manajemen Karyawan</CardTitle>
            <CardDescription>Kelola data karyawan restoran</CardDescription>
          </div>
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Karyawan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Karyawan Baru</DialogTitle>
                <DialogDescription>
                  Masukkan data karyawan baru.
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Password default: <b>password123</b> (atau isi manual)
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="empName">Nama Lengkap</Label>
                  <Input
                    id="empName"
                    placeholder="Masukkan nama lengkap"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empRole">Posisi</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) =>
                      setNewEmployee({ ...newEmployee, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kasir">Kasir</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empEmail">Email</Label>
                  <Input
                    id="empEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empPassword">Password</Label>
                  <Input
                    id="empPassword"
                    type="password"
                    placeholder="Kosongkan untuk default"
                    value={newEmployee.password}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={addEmployee}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan Karyawan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) =>
              editId === employee.id ? (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={editData.role}
                      onValueChange={(value) =>
                        setEditData((d) => ({ ...d, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kasir">Kasir</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.email}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, email: e.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveEdit(employee.id)}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(employee.role)}
                      {employee.role}
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(employee)}
                        disabled={loading}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEmployee(employee.id)}
                        disabled={loading}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
