"use client";

import { useEffect, useState } from "react";
import { Tabs, TabItem } from "flowbite-react";
import { orderService } from "@/services/orderService";
import OrderCard from "./OrderCard";
import { STATUS_MAP } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { eventBus } from "@/utils/eventBus";
import { useLocale, useTranslations } from "use-intl";
import { Order } from "@/interfaces/Order";

export default function OrderTabs() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const t = useTranslations("order");

  const handleGetOrders = async (userId: string, status: string) => {
    try {
      setLoading(true);
      const res = await orderService.getOrdersByUser(userId, { status });
      if (res?.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetOrders(user?._id, status);
  }, [user?._id, status]);

  useEffect(() => {
    const refreshOrders = () => handleGetOrders(user?._id, status);
    eventBus.on("orderUpdated", refreshOrders);
    return () => {
      eventBus.off("orderUpdated", refreshOrders);
    };
  }, [user?._id, status]);

  return (
    <Tabs
      aria-label={t("orders")}
      variant="underline"
      onActiveTabChange={(tabIndex) => {
        const keys = Object.keys(STATUS_MAP);
        setStatus(keys[tabIndex]);
        setExpandedId(null);
      }}
    >
      {Object.entries(STATUS_MAP).map(([key, { label }]) => (
        <TabItem key={key} title={t(label)}>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
            </div>
          ) : orders.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  expanded={expandedId === order._id}
                  onToggle={() =>
                    setExpandedId(expandedId === order._id ? null : order._id)
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-8 text-center">
              {t("noOrderInThisStatus")}
            </p>
          )}
        </TabItem>
      ))}
    </Tabs>
  );
}
