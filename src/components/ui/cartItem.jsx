import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function CartItem({ item, onMinus, onPlus }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{item.name}</h4>
        <p className="text-sm text-gray-600">
          Rp {item.price.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onMinus}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button size="sm" variant="outline" onClick={onPlus}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}