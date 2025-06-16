"use client";
import { useEffect, useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Helper status badge (status selalu Tersedia karena stock tidak ada)
function getStatusColor(status) {
  return "bg-green-100 text-green-800";
}

export default function AdminMenu({ menuItems, setMenuItems }) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();

  // Untuk edit menu
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Fetch menu dari API
  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch {
      setMenuItems([]);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line
  }, [setMenuItems]);

  // Tambah menu baru
  const addMenuItem = async (e) => {
    e.preventDefault();
    if (
      !newMenuItem.name ||
      !newMenuItem.price ||
      !newMenuItem.category ||
      !file
    ) {
      alert("Semua field & gambar wajib diisi!");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newMenuItem.name);
      formData.append("price", newMenuItem.price);
      formData.append("category", newMenuItem.category);
      formData.append("description", newMenuItem.description || "");
      formData.append("image", file);

      const res = await fetch("/api/menu", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsAddMenuOpen(false);
        setNewMenuItem({
          name: "",
          price: "",
          category: "",
          description: "",
        });
        setFile(null);
        fileInputRef.current.value = "";
        fetchMenus();
      } else {
        const err = await res.json();
        alert("Gagal menambah menu: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Gagal menambah menu");
    }
    setIsLoading(false);
  };

  // Mulai edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      ...item,
      price: item.price ? String(item.price) : "",
      description: item.description || "",
    });
    setEditFile(null);
    setEditImagePreview(
      item.imageUrl ? `/images/menu/${item.imageUrl}` : "/placeholder.svg"
    );
  };

  // Batal edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setEditFile(null);
    setEditImagePreview(null);
  };

  // Simpan edit (mendukung update gambar)
  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      let res;
      if (editFile) {
        // Jika gambar baru dipilih, kirim multipart/form-data
        const formData = new FormData();
        formData.append("name", editData.name);
        formData.append("price", editData.price);
        formData.append("category", editData.category);
        formData.append("description", editData.description);
        formData.append("image", editFile);

        res = await fetch(`/api/menu/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Tanpa gambar, kirim JSON
        res = await fetch(`/api/menu/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editData.name,
            price: editData.price,
            category: editData.category,
            description: editData.description,
          }),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        alert("Gagal update: " + (err.error || "Unknown error"));
      } else {
        fetchMenus();
        setEditingId(null);
        setEditData({});
        setEditFile(null);
        setEditImagePreview(null);
      }
    } catch {
      alert("Gagal update menu");
      return res
        .status(400)
        .json({ error: "Gagal update menu", detail: e?.message || e });
    }
    setIsLoading(false);
  };

  // Hapus menu
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus menu ini?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Gagal hapus: " + (err.error || "Unknown error"));
      } else {
        fetchMenus();
      }
    } catch {
      alert("Gagal hapus menu");
    }
    setIsLoading(false);
  };

  // Saat user pilih file baru di edit, preview dulu
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditFile(file);
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview(
        editData.imageUrl
          ? `/images/menu/${editData.imageUrl}`
          : "/placeholder.svg"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manajemen Menu</CardTitle>
            <CardDescription>Kelola menu dan harga restoran</CardDescription>
          </div>
          <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Menu Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail menu baru dan upload gambar.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={addMenuItem}
                encType="multipart/form-data"
              >
                <div className="space-y-2">
                  <Label htmlFor="menuName">Nama Menu</Label>
                  <Input
                    id="menuName"
                    placeholder="Masukkan nama menu"
                    value={newMenuItem.name}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuPrice">Harga</Label>
                  <Input
                    id="menuPrice"
                    type="number"
                    placeholder="Masukkan harga"
                    value={newMenuItem.price}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuCategory">Kategori</Label>
                  <Select
                    value={newMenuItem.category}
                    onValueChange={(value) =>
                      setNewMenuItem({ ...newMenuItem, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Makanan Utama">
                        Makanan Utama
                      </SelectItem>
                      <SelectItem value="Minuman">Minuman</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                      <SelectItem value="Appetizer">Appetizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menuImage">Gambar Menu</Label>
                  <Input
                    id="menuImage"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Menu"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Nama Menu</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) =>
                editingId === item.id ? (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={editImagePreview}
                        alt={editData.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        className="mt-2"
                        onChange={handleEditFileChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((data) => ({
                            ...data,
                            name: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editData.category}
                        onValueChange={(value) =>
                          setEditData((data) => ({
                            ...data,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Makanan Utama">
                            Makanan Utama
                          </SelectItem>
                          <SelectItem value="Minuman">Minuman</SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                          <SelectItem value="Appetizer">Appetizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.price}
                        onChange={(e) =>
                          setEditData((data) => ({
                            ...data,
                            price: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor()}>Tersedia</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveEdit}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={
                          item.imageUrl
                            ? `/images/menu/${item.imageUrl}`
                            : "/placeholder.svg"
                        }
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      Rp {item.price?.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor()}>Tersedia</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400">
                  Tidak ada menu tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
