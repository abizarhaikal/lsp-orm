import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Komponen utama: InvoiceModal
export default function InvoiceModal({ order }) {
  if (!order) return null;

  // Hitung total
  const total =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  const printInvoice = () => {
    // Ganti dengan logic print PDF/invoice sesuai kebutuhan
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Cetak Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg print:max-w-full print:block">
        <DialogHeader>
          <DialogTitle>Invoice #{order.order_number}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">Pelanggan:</span>{" "}
            {order.customer_name} <br />
            <span className="font-semibold">Status:</span>{" "}
            <Badge className="bg-green-100 text-green-800 capitalize">
              {order.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <Card className="shadow-none border-0 print:border-0">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Detail Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Menu</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={item.menu_item_id || item.id || idx}>
                    <td className="py-1">{item.menu_name}</td>
                    <td className="text-center py-1">{item.quantity}x</td>
                    <td className="text-right py-1">
                      Rp {item.price.toLocaleString("id-ID")}
                    </td>
                    <td className="text-right py-1">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Total</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={printInvoice}
            variant="default"
            className="print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print / Download
          </Button>
          {/* Dialog close button di luar otomatis */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
