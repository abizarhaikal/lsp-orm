"use client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminIngredients({ ingredients, setIngredients }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Bahan Baku</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500">Tabel bahan baku di sini.</div>
      </CardContent>
    </Card>
  );
}
