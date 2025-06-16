import { Button } from "@/components/ui/button";

export default function CartSummary({ total, onCheckout }) {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center font-bold">
        <span>Total:</span>
        <span className="text-green-600">
          Rp {total.toLocaleString("id-ID")}
        </span>
      </div>
      <Button className="w-full mt-4" onClick={onCheckout}>
        Pesan Sekarang
      </Button>
    </div>
  );
}
