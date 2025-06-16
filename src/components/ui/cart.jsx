import CartItem from "./cartItem";
import CartSummary from "./cartSummary";

export default function Cart({ cart, onMinus, onPlus, total, onCheckout }) {
  return (
    <>
      {cart.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
      ) : (
        <>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onMinus={() => onMinus(item)}
              onPlus={() => onPlus(item)}
            />
          ))}
          <CartSummary total={total} onCheckout={onCheckout} />
        </>
      )}
    </>
  );
}
