"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

// Hitung total semua item
const calculateOrderTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default function OrderSummary({ orderDetails }) {
  const orderTotal = calculateOrderTotal(orderDetails.items);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Pesanan</CardTitle>
        <CardDescription>
          Pesanan pada {orderDetails.date}
          {orderDetails.time && ` pukul ${orderDetails.time}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Item Pesanan</h3>
          </div>
          <div className="space-y-3">
            {orderDetails.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rp {orderTotal.toLocaleString("id-ID")}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>Rp {orderTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">
                Informasi Pembayaran
              </h4>
              <p className="text-sm text-blue-600">
                Silakan pilih metode pembayaran yang tersedia dan lengkapi
                informasi yang diperlukan.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
