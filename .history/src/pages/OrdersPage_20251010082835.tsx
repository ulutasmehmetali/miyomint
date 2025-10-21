import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { localStorageService, Order } from "../lib/localStorage";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userOrders = localStorageService.getOrdersByUserId(user.id);
    const sortedOrders = [...userOrders].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
    setOrders(sortedOrders);
    setLoading(false);
  }, [user]);

  const getStatusData = (status: string) => {
    switch (status) {
      case "pending":
        return { icon: <Clock className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-800", text: "Beklemede" };
      case "processing":
        return { icon: <Package className="w-5 h-5" />, color: "bg-blue-100 text-blue-800", text: "Hazırlanıyor" };
      case "shipped":
        return { icon: <Truck className="w-5 h-5" />, color: "bg-teal-100 text-teal-800", text: "Kargoda" };
      case "delivered":
        return { icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-100 text-green-800", text: "Teslim Edildi" };
      case "cancelled":
        return { icon: <XCircle className="w-5 h-5" />, color: "bg-red-100 text-red-800", text: "İptal Edildi" };
      default:
        return { icon: <Clock className="w-5 h-5" />, color: "bg-gray-100 text-gray-800", text: "Bilinmiyor" };
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600">
        <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
        <p className="text-lg font-medium">Siparişlerinizi görmek için lütfen giriş yapın.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-500">Siparişleriniz yükleniyor...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600 text-center">
        <ShoppingBag className="w-14 h-14 text-teal-600 mb-3" />
        <h2 className="text-xl font-semibold mb-1">Henüz siparişiniz yok</h2>
        <p className="text-gray-500">İlk siparişinizi vermek için ürünlerimize göz atabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Siparişlerim</h1>
            <p className="text-teal-50 mt-1 text-sm">
              Geçmiş siparişlerinizi ve durumlarını buradan takip edebilirsiniz.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.map((order) => {
              const status = getStatusData(order.status);
              return (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Sipariş No: {order.order_number}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm ${status.color}`}
                    >
                      {status.icon} {status.text}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-teal-600" />
                          <p className="text-gray-700">
                            {item.name} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-right border-t border-gray-100 pt-3">
                    <p className="text-gray-700">
                      Toplam:{" "}
                      <span className="font-bold text-teal-600">
                        ₺{order.total_amount.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
