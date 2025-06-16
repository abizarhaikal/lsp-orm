"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CardMenu({ item, onAdd }) {
  // Fallback ke gambar default jika imageUrl kosong/null
  let imgSrc = "/images/menu/no-image.jpg";
  if (item.imageUrl) {
    // Jika imageUrl sudah berupa URL penuh, gunakan langsung
    if (item.imageUrl.startsWith("http")) {
      imgSrc = item.imageUrl;
    } else {
      // Jika hanya nama file, cari di public/images/menu/
      imgSrc = `/images/menu/${item.imageUrl}`;
    }
  }

  // Normalize stock value - handle null/undefined cases
  const stock = item.stock ?? 0;

  // Determine stock status
  const getStockStatus = () => {
    if (stock === 0) return "Habis";
    if (stock <= 5) return "Sedikit";
    return "Tersedia";
  };

  const getStockColor = () => {
    if (stock === 0) return "text-red-500";
    if (stock <= 5) return "text-yellow-500";
    return "text-green-500";
  };

  // Check if item is available
  const isAvailable = stock > 0;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={imgSrc}
          alt={item.name}
          width={300}
          height={200}
          className="w-full h-32 object-cover rounded-md"
          onError={(e) => {
            // Fallback ke gambar default jika gagal load
            if (e.target.src !== "/images/menu/no-image.jpg") {
              e.target.src = "/images/menu/no-image.jpg";
            }
          }}
        />
        {/* Stock status badge */}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Habis
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.category}</p>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold text-green-600">
            Rp {item.price?.toLocaleString("id-ID") || "0"}
          </p>
          <p className={`text-sm font-medium ${getStockColor()}`}>
            Stok: {stock} ({getStockStatus()})
          </p>
        </div>
      </div>

      {/* Tombol "Tambah ke Keranjang" */}
      <Button
        onClick={() => onAdd(item)}
        className={`w-full ${
          !isAvailable
            ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90"
        }`}
        size="sm"
        disabled={!isAvailable}
      >
        <Plus className="h-4 w-4 mr-1" />
        {isAvailable ? "Tambah ke Keranjang" : "Stok Habis"}
      </Button>
    </div>
  );
}
