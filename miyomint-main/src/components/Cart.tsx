import { Minus, Plus, Trash2, X } from "lucide-react";

import { CartItem } from "../types";

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (
    productId: string,
    quantity: number
  ) => void | Promise<void>;
  onRemoveItem: (productId: string) => void | Promise<void>;
  onCheckout?: () => void;
}

export default function Cart({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  if (!isOpen) return null;

  const handleDecrease = (productId: string, quantity: number) => {
    if (quantity <= 1) return;
    onUpdateQuantity(productId, quantity - 1);
  };

  const handleIncrease = (productId: string, quantity: number) => {
    onUpdateQuantity(productId, quantity + 1);
  };

  const handleCheckoutClick = () => {
    onClose();
    setTimeout(() => onCheckout?.(), 200);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Sepetim</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition hover:text-gray-600"
            aria-label="Sepeti kapat"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">Sepetiniz bos</p>
              <p className="mt-2 text-sm text-gray-400">
                Urun ekleyerek alisverise baslayin
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id ?? item.product_id}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">Gorsel yok</span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="truncate font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 font-bold text-teal-600">
                        {item.price} TL
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="text-gray-400 transition hover:text-red-600"
                      aria-label="Urunu kaldir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-1">
                      <button
                        onClick={() =>
                          handleDecrease(item.product_id, item.quantity)
                        }
                        className="p-1 text-gray-600 transition hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        aria-label="Adedi azalt"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleIncrease(item.product_id, item.quantity)
                        }
                        className="p-1 text-gray-600 transition hover:text-teal-600"
                        aria-label="Adedi artir"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="font-bold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} TL
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Toplam</span>
              <span className="text-2xl font-bold text-teal-600">
                {total.toFixed(2)} TL
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-4 px-6 font-semibold text-white shadow-md transition hover:from-teal-600 hover:to-teal-700 hover:shadow-lg"
            >
              Siparisi Tamamla
            </button>

            <p className="mt-3 text-center text-sm text-gray-600">
              Ucretsiz kargo ile gonderim
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
