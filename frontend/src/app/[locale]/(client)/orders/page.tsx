// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { Tabs, TabItem, Card, Badge } from "flowbite-react";
// import {
//   FaClock,
//   FaTimesCircle,
//   FaMoneyBillWave,
//   FaBoxOpen,
//   FaCheckCircle,
// } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";
// import { orderService } from "@/services/orderService";

// const STATUS_MAP = {
//   pending: {
//     label: "Đang xử lý",
//     color: "warning",
//     icon: <FaClock className="inline mr-1" />,
//   },
//   paid: {
//     label: "Đã thanh toán",
//     color: "success",
//     icon: <FaMoneyBillWave className="inline mr-1" />,
//   },
//   shipped: {
//     label: "Đã giao",
//     color: "info",
//     icon: <FaBoxOpen className="inline mr-1" />,
//   },
//   cancelled: {
//     label: "Đã hủy",
//     color: "failure",
//     icon: <FaTimesCircle className="inline mr-1" />,
//   },
// };

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState("pending");
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const userId = "68bea11edb9431f875386e1e"; // sau này lấy từ context

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await orderService.getOrdersByUser(userId, { status });
//         setOrders(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [status]);

//   return (
//     <div className="min-h-screen bg-[#0b0b0b] text-gray-100 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold mb-10 text-center text-white">
//           Đơn hàng của bạn
//         </h1>

//         <div className="bg-[#111] rounded-2xl shadow-md shadow-yellow-500/10 p-4 md:p-6 border border-gray-800">
//           <Tabs
//             aria-label="Tabs đơn hàng"
//             variant="underline"
//             theme={{
//               tablist: {
//                 base: "flex justify-center overflow-x-auto border-b border-gray-700",
//                 tabitem: {
//                   base: "px-5 py-3 text-sm font-medium text-gray-400 hover:text-yellow-400 transition",
//                   styles: {
//                     underline: {
//                       active:
//                         "text-yellow-400 border-b-2 border-yellow-400 rounded-none",
//                     },
//                   },
//                 },
//               },
//             }}
//             onActiveTabChange={(tabIndex) => {
//               const keys = Object.keys(STATUS_MAP);
//               setStatus(keys[tabIndex]);
//               setExpandedId(null);
//             }}
//           >
//             {Object.entries(STATUS_MAP).map(([key, { label }]) => (
//               <TabItem key={key} title={label}>
//                 {loading ? (
//                   <div className="flex justify-center py-10">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
//                   </div>
//                 ) : orders.length ? (
//                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
//                     {orders.map((order) => {
//                       const expanded = expandedId === order._id;
//                       return (
//                         <motion.div
//                           key={order._id}
//                           layout
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{ duration: 0.3 }}
//                         >
//                           <Card
//                             onClick={() =>
//                               setExpandedId(expanded ? null : order._id)
//                             }
//                             className={`cursor-pointer transition duration-300 border border-gray-700 bg-[#1a1a1a] hover:border-yellow-400 ${
//                               expanded ? "shadow-lg shadow-yellow-500/30" : ""
//                             }`}
//                           >
//                             <div className="flex justify-between items-start mb-3">
//                               <h5 className="text-lg font-semibold text-white">
//                                 Đơn #{order._id.slice(-6)}
//                               </h5>
//                               <Badge
//                                 color={
//                                   STATUS_MAP[order.status]?.color || "gray"
//                                 }
//                               >
//                                 {STATUS_MAP[order.status]?.icon}
//                                 {STATUS_MAP[order.status]?.label ||
//                                   order.status}
//                               </Badge>
//                             </div>

//                             {/* --- Thông tin tóm tắt --- */}
//                             <div className="text-sm text-gray-300 space-y-2">
//                               <div className="flex gap-2 overflow-hidden">
//                                 {order.items.slice(0, 2).map((item, idx) => {
//                                   const variant = item.book?.variants?.find(
//                                     (v) => v._id === item.variantId
//                                   );
//                                   return (
//                                     <div
//                                       key={idx}
//                                       className="flex gap-2 items-center"
//                                     >
//                                       <div className="relative w-12 h-12">
//                                         <Image
//                                           src={
//                                             variant?.image ||
//                                             item.book?.images?.[0]?.url ||
//                                             "/placeholder.jpg"
//                                           }
//                                           alt={item.book?.title || "Book"}
//                                           fill
//                                           className="object-cover rounded border border-gray-700"
//                                         />
//                                       </div>
//                                       <div className="truncate">
//                                         <p className="font-medium text-white truncate">
//                                           {item.book?.title}
//                                         </p>
//                                         {variant && (
//                                           <p className="text-xs text-gray-400">
//                                             {variant.rarity} • {item.quantity}x
//                                           </p>
//                                         )}
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                                 {order.items.length > 2 && (
//                                   <span className="text-xs text-gray-500 self-center">
//                                     +{order.items.length - 2} sản phẩm khác
//                                   </span>
//                                 )}
//                               </div>

//                               <p>
//                                 <strong>Tổng tiền:</strong>{" "}
//                                 <span className="text-yellow-400 font-semibold">
//                                   {order.finalAmount?.toLocaleString("vi-VN")}₫
//                                 </span>
//                               </p>

//                               <p>
//                                 <strong>Ngày tạo:</strong>{" "}
//                                 {new Date(order.createdAt).toLocaleString(
//                                   "vi-VN"
//                                 )}
//                               </p>
//                             </div>

//                             {/* --- Nút hành động --- */}
//                             <div className="mt-3 flex justify-end gap-3">
//                               {order.status === "pending" && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                   }}
//                                   className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
//              rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(255,0,0,0.5)]
//              hover:shadow-[0_0_15px_rgba(255,50,50,0.7)] transition-all"
//                                 >
//                                   <FaTimesCircle className="text-white" />
//                                   Hủy đơn
//                                 </button>
//                               )}
//                               {order.status === "shipped" && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     // TODO: gọi API cập nhật trạng thái “delivered”
//                                   }}
//                                   className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
//                rounded-full flex items-center gap-2
//                shadow-[0_0_10px_rgba(0,128,0,0.5)] hover:shadow-[0_0_15px_rgba(0,200,0,0.7)]
//                transition-all"
//                                 >
//                                   <FaCheckCircle className="text-white" />
//                                   Đã nhận hàng
//                                 </button>
//                               )}
//                             </div>

//                             {/* --- Chi tiết mở rộng --- */}
//                             <AnimatePresence>
//                               {expanded && (
//                                 <motion.div
//                                   initial={{ opacity: 0, height: 0 }}
//                                   animate={{ opacity: 1, height: "auto" }}
//                                   exit={{ opacity: 0, height: 0 }}
//                                   className="mt-4 border-t border-gray-600 pt-3"
//                                 >
//                                   <div className="space-y-3 text-gray-300">
//                                     <h6 className="text-yellow-400 font-semibold text-sm uppercase">
//                                       Chi tiết đơn hàng
//                                     </h6>

//                                     {/* Danh sách sản phẩm */}
//                                     <div className="space-y-3">
//                                       {order.items.map((item, idx) => {
//                                         const variant =
//                                           item.book?.variants?.find(
//                                             (v) => v._id === item.variantId
//                                           );
//                                         return (
//                                           <div
//                                             key={idx}
//                                             className="flex gap-3 items-center border-b border-gray-700 pb-2"
//                                           >
//                                             <div className="relative w-14 h-14 flex-shrink-0">
//                                               <Image
//                                                 src={
//                                                   variant?.image ||
//                                                   item.book?.images?.[0]?.url ||
//                                                   "/placeholder.jpg"
//                                                 }
//                                                 alt={item.book?.title || "Book"}
//                                                 fill
//                                                 className="object-cover rounded border border-gray-700"
//                                               />
//                                             </div>
//                                             <div className="flex-1">
//                                               <p className="font-medium text-white">
//                                                 {item.book?.title}
//                                               </p>
//                                               {variant && (
//                                                 <p className="text-xs text-gray-400">
//                                                   {variant.rarity} •{" "}
//                                                   {item.quantity}x
//                                                 </p>
//                                               )}
//                                             </div>
//                                             <p className="text-yellow-400 font-semibold">
//                                               {(
//                                                 item.price * item.quantity
//                                               ).toLocaleString("vi-VN")}
//                                               ₫
//                                             </p>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>

//                                     {/* Thông tin giao hàng */}
//                                     <div className="pt-2">
//                                       <h6 className="text-yellow-400 font-semibold text-sm uppercase mb-1">
//                                         Thông tin giao hàng
//                                       </h6>
//                                       <p>
//                                         <strong>Tên người nhận:</strong>{" "}
//                                         {order.shippingAddress?.name || "—"}
//                                       </p>
//                                       <p>
//                                         <strong>Số điện thoại:</strong>{" "}
//                                         {order.shippingAddress?.phone || "—"}
//                                       </p>
//                                       <p>
//                                         <strong>Địa chỉ:</strong>{" "}
//                                         {order.shippingAddress?.address || "—"}
//                                       </p>
//                                     </div>

//                                     {/* Phương thức thanh toán */}
//                                     <div className="pt-2 border-t border-gray-700">
//                                       <h6 className="text-yellow-400 font-semibold text-sm uppercase mb-1">
//                                         Thanh toán
//                                       </h6>
//                                       <p>
//                                         <strong>Phương thức:</strong>{" "}
//                                         {order.paymentMethod === "vnpay"
//                                           ? "VNPay"
//                                           : order.paymentMethod === "momo"
//                                           ? "MoMo"
//                                           : "Khi nhận hàng"}
//                                       </p>
//                                       <p>
//                                         <strong>Trạng thái:</strong>{" "}
//                                         <span className="text-green-400">
//                                           {order.paymentMethod !== "cod"
//                                             ? "Đã thanh toán"
//                                             : "Chưa thanh toán"}
//                                         </span>
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </motion.div>
//                               )}
//                             </AnimatePresence>
//                           </Card>
//                         </motion.div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic mt-8 text-center">
//                     Không có đơn hàng nào trong trạng thái này.
//                   </p>
//                 )}
//               </TabItem>
//             ))}
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }

import OrderTabs from "./components/OrderTabs";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center text-white">
          Đơn hàng của bạn
        </h1>

        <div className="bg-[#111] rounded-2xl shadow-md shadow-yellow-500/10 p-4 md:p-6 border border-gray-800">
          <OrderTabs />
        </div>
      </div>
    </div>
  );
}
