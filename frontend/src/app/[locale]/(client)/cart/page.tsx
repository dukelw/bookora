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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/checkoutStore";
import { paymentService } from "@/services/paymentService";
import { REDIRECT_URL, SHIPPING_FEE } from "@/constants";
import { clearGuestId, getOrCreateGuestId } from "@/lib/guest";
import { authService } from "@/services/authService";
import Loader from "@/components/loader/Loader";
import { loyaltyService } from "@/services/loyaltyService";
import LoyaltyBalance from "@/interfaces/LoyaltyBalance";
import { addressService } from "@/services/addressService";

export default function CheckoutPage() {
  const t = useTranslations("cart");
  const { user, setUser } = useAuthStore(); // nếu bạn có action setUser trong authStore, dùng để cập nhật user sau register
  const [cart, setCart] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setCheckout } = useCheckoutStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyBalance>({
    points: 0,
    vndValue: 0,
    vndPerPoint: 1000,
  });

  // helper lấy ownerId (userId nếu login, else guestId)
  const getOwnerId = () => user?._id || getOrCreateGuestId();

  const handleGetCart = async () => {
    try {
      const ownerId = getOwnerId();
      const res = await cartService.getCart(ownerId);
      setCart(res);
      setSelectedItems(res.items.map((item: any) => item._id));
    } catch (err) {
      console.error("getCart error", err);
      toast.error("Không thể tải giỏ hàng");
    }
  };

  const handleGetLoyaltyPoint = async () => {
    const res = await loyaltyService.getBalance();
    if (res) {
      setLoyaltyPoint(res);
    }
  };

  const handleGetAddresses = async () => {
    let addressResponse = {
      addresses: [],
      shippingAddress: "",
    };
    if (user?._id) {
      addressResponse = await addressService.getAddresses();
    }
    return addressResponse;
  };

  // Khi component mount hoặc user đổi (login/ logout), fetch cart
  useEffect(() => {
    const fetchData = async () => {
      await handleGetCart();
      await handleGetLoyaltyPoint();

      if (user?._id) {
        const addressResponse = await handleGetAddresses(); // <-- await ở đây
        setFormData({
          name: user.name || "",
          phone: user.phone || user.phoneNumber || "",
          email: user.email || "",
          address: addressResponse.shippingAddress
            ? addressResponse.shippingAddress
            : user.shippingAddress || "",
          city: user.city || "",
          note: "",
        });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

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

  const shippingFee = SHIPPING_FEE;
  const total = subtotal - discount + shippingFee - loyaltyPoint.vndValue;

  const handleSubmit = async () => {
    try {
      // ensure we have a cart (guest will have guest cart created on add)
      if (!cart) {
        toast.error("Không tìm thấy giỏ hàng!");
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

      setIsSubmitting(true);

      const guestId = getOrCreateGuestId();

      let currentUser = user;

      if (!currentUser?._id) {
        const res = await authService.registerFromCheckout({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        });

        // update auth store if you have setter (so user is considered logged)
        if (res?.user) {
          // if your authStore has a setUser or setAuth action, call it:
          try {
            setUser?.(res.user); // optional: only if your store provides it
          } catch {
            // ignore if store doesn't expose it
          }
          currentUser = res.user;
        } else {
          toast.error("Tạo tài khoản thất bại");
          return;
        }
      }
      // clear guestId
      clearGuestId();

      await cartService.mergeCart(currentUser._id, guestId);

      // refresh cart (now user cart)
      handleGetCart();

      // build order payload using mergedCart
      const items = cart.items
        .filter((i: any) => selectedItems.includes(i._id))
        .map((i: any) => {
          const variant = i.book.variants.find(
            (v: any) => v._id === i.variantId
          );
          return {
            book: i.book._id,
            variantId: i.variantId,
            variant,
            bookDetail: i.book,
            quantity: i.quantity,
            price: variant?.price || 0,
            finalPrice: variant?.price || 0,
          };
        });

      const payload = {
        items,
        selectedItems,
        totalAmount: subtotal,
        discountAmount: discount,
        finalAmount: total,
        shippingFee,
        discountCode: appliedDiscount?.code || undefined,
        user: currentUser._id,
        paymentMethod,
        shippingAddress: formData,
        cart: cart._id,
        loyaltyPointsUsed: loyaltyPoint.points,
        loyaltyDiscountAmount: loyaltyPoint.vndValue,
      };

      setCheckout(payload);

      // xử lý payment
      if (paymentMethod === "cod") {
        router.push("/payment/success");
      } else if (paymentMethod === "momo") {
        router.push("/payment/momo");
      } else if (paymentMethod === "vnpay") {
        try {
          const res = await paymentService.payWithVnpay(total, REDIRECT_URL);
          if (res?.paymentUrl) {
            window.location.href = res.paymentUrl;
          } else {
            toast.error("Không tạo được liên kết thanh toán VNPay");
          }
        } catch (err) {
          toast.error("Lỗi khi tạo thanh toán VNPay");
        }
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo đơn hàng:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi tạo đơn hàng!";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ownerId = getOwnerId();

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-10 px-6">
      {isSubmitting && (
        <Loader
          fullscreen
          message={t("processingOrder") || "Đang xử lý đơn hàng..."}
        />
      )}
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
              userId={ownerId} // pass ownerId: userId or guestId
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
            loyaltyPointsUsed={loyaltyPoint}
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
