"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CardMenu({ item, onAdd }) {
  // Fallback ke gambar default jika imageUrl kosong/null
  // item.imageUrl bisa "d77y47clas1boh8ptjar5jmal.jpg" atau null/undefined
  let imgSrc = "/images/menu/no-image.jpg";
  if (item.imageUrl) {
    // Jika imageUrl sudah berupa URL penuh, gunakan langsung
    if (item.imageUrl.startsWith("http")) {
      imgSrc = item.imageUrl;
    } else {
      // Jika hanya nama file, maka selalu cari di public/images/menu/
      imgSrc = `/images/menu/${item.imageUrl}`;
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <img
        src={imgSrc}
        alt={item.name}
        width={300}
        height={200}
        className="w-full h-32 object-cover rounded-md"
        onError={(e) => {
          // Kalau gagal load, fallback ke gambar default
          if (e.target.src !== "/images/menu/no-image.jpg") {
            e.target.src = "/images/menu/no-image.jpg";
          }
        }}
      />
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.category}</p>
        <p className="text-lg font-bold text-green-600">
          Rp {item.price.toLocaleString("id-ID")}
        </p>
      </div>
      <Button onClick={() => onAdd(item)} className="w-full" size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Tambah ke Keranjang
      </Button>
    </div>
  );
}
