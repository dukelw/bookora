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
import { orderService } from "@/services/orderService";
import { toast } from "react-toastify";

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

  const handleGetCart = async () => {
    const res = await cartService.getCart(user._id);
    setCart(res);
    setSelectedItems(res.items.map((item: any) => item._id));
  };

  useEffect(() => {
    if (!user?._id) return;
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      city: user.city || "",
      note: "",
    });
    handleGetCart();
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

  const handleSubmit = async () => {
    try {
      // ⚡ Kiểm tra điều kiện cơ bản
      if (!cart || !user?._id) {
        toast.error("Không tìm thấy giỏ hàng hoặc thông tin người dùng!");
        return;
      }

      if (!formData.name || !formData.phone || !formData.address) {
        toast.warning("Vui lòng nhập đầy đủ thông tin giao hàng!");
        return;
      }

      if (!selectedItems.length) {
        toast.warning("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
        return;
      }

      // setIsSubmitting(true);

      // 🧮 Chuẩn bị danh sách sản phẩm
      const items = cart.items
        .filter((i: any) => selectedItems.includes(i._id))
        .map((i: any) => {
          const variant = i.book.variants.find(
            (v: any) => v._id === i.variantId
          );
          return {
            book: i.book._id,
            variantId: i.variantId,
            quantity: i.quantity,
            price: variant?.price || 0,
            finalPrice: variant?.price || 0,
          };
        });

      // 📦 Chuẩn bị payload gửi backend
      const payload = {
        items,
        selectedItems,
        totalAmount: subtotal,
        discountAmount: discount,
        finalAmount: total,
        discountCode: appliedDiscount?.code || undefined,
        user: user._id,
        paymentMethod,
        shippingAddress: formData,
        cart: cart._id,
      };

      console.log("📦 Sending order:", payload);

      // 🛒 Gọi API tạo đơn hàng
      const order = await orderService.createOrder(payload);

      // ✅ Thành công
      toast.success("Đặt hàng thành công!");
      console.log("✅ Order created:", order);

      // Làm mới giỏ hàng
      handleGetCart();

      // Điều hướng sang trang chi tiết đơn hàng nếu muốn
      // router.push(`/orders/${order._id}`);
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo đơn hàng:", error);

      // Nếu server có message cụ thể, hiển thị message đó
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi tạo đơn hàng!";
      toast.error(msg);
    } finally {
      // setIsSubmitting(false);
    }
  };

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
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
