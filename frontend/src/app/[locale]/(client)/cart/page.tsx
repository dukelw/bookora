"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "use-intl";
import ShippingForm from "./components/ShippingForm";
import PaymentMethod from "./components/PaymentMethod";
import CartItemList from "./components/CartItemList";
import CartSummary from "./components/CartSummary";
import { cartService } from "@/services/cartService";
import VoucherList from "./components/VoucherList";

export default function CheckoutPage() {
  const t = useTranslations("cart");
  const { user } = useAuthStore();
  const [cart, setCart] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (!user?._id) return;
    cartService.getCart(user._id).then((res) => {
      setCart(res);
      setSelectedItems(res.items.map((item: any) => item._id));
    });
  }, [user]);

  const subtotal =
    cart?.items.reduce((sum: any, item: any) => {
      if (!selectedItems.includes(item._id)) return sum;
      const variant = item.book.variants?.find(
        (v: any) => v._id === item.variantId
      );
      return sum + (variant?.price || 0) * item.quantity;
    }, 0) || 0;
  const discount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? Math.floor(subtotal * (appliedDiscount.value / 100))
      : appliedDiscount.value
    : 0;

  const shippingFee = 0;
  const total = subtotal - discount + shippingFee;

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {t("shippingInformation")}
          </h2>
          <ShippingForm formData={formData} setFormData={setFormData} t={t} />
          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            t={t}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
          {cart && (
            <CartItemList
              cart={cart}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              setCart={setCart}
              userId={user._id}
              t={t}
            />
          )}
          <VoucherList
            subtotal={subtotal}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            t={t}
          />

          <CartSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            discount={discount}
            total={total}
            t={t}
            onSubmit={() =>
              console.log({
                formData,
                selectedItems,
                paymentMethod,
                total,
                appliedDiscount,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
