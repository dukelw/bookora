"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import { mailService } from "@/services/mailService";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const c = useTranslations("contact");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.warn(c("warn"));
      return;
    }
    try {
        setLoading(true);
        await mailService.sendMail({
            to: form.email,
            subject: `Cảm ơn ${form.name} đã liên hệ với Bookora`,
            name: form.name,
            content: `
                <p>Cảm ơn bạn đã liên hệ với <strong>Bookora</strong>! Chúng tôi đã nhận được tin nhắn của bạn:</p>
                <blockquote style="border-left: 4px solid #00bcd4; padding-left: 10px; color: #555;">
                    ${form.message}
                </blockquote>
                <p>Đội ngũ <strong>Bookora</strong> sẽ phản hồi bạn sớm nhất có thể qua email này.</p>
                <br />
                <p>Trân trọng,</p>
                <br />
                <p><strong>Bookora Store</strong></p>
            `,
        });
        toast.success(c("success"));
        setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error(c("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl bg-gradient-to-br from-cyan-70 to-white py-16 px-6">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-5xl font-extrabold bg-cyan-600 hover text-transparent bg-clip-text">{c("title")}</h1>
        <p className="text-gray-600 mt-12 max-w-5xl mx-auto">{c("intro")}</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col justify-between" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <h2 className="text-2xl font-bold text-cyan-600 mb-6">{c("infoContact")}</h2>
            <div className="space-y-5 text-gray-700">
              <p className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-cyan-600 text-xl" />
                <span>{c("address")}</span>
              </p>
              <p className="flex items-center gap-3">
                <FaPhoneAlt className="text-cyan-600 text-xl" />
                <span>+84 324 782 904</span>
              </p>
              <p className="flex items-center gap-3">
                <FaEnvelope className="text-cyan-600 text-xl" />
                <span>bookora@gmail.com</span>
              </p>
              <p className="flex items-center gap-3">
                <FaClock className="text-cyan-600 text-xl" />
                <span>{c("open")}</span>
              </p>
            </div>
          </div>
          <div className="mt-10 rounded-2xl overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.120589814894!2d-73.98774432329674!3d40.75937237138658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c256598d232339%3A0xda8b85263f93969e!2sBroadway%2C%20New%20York%2C%20Hoa%20K%E1%BB%B3!5e0!3m2!1svi!2s!4v1760806216576!5m2!1svi!2s"
              width="100%"
              height="260"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl font-bold text-cyan-600 mb-6">{c("formContact")}</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">{c("name")}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={c("placeholderName")}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={c("placeholderEmail")}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">{c("message")}</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={c("placeholderMessage")}
                rows={5}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className={`w-full py-3 text-white flex justify-center items-center rounded-xl shadow-md transition-all ${loading ? "bg-cyan-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"}`}
            >
              <FaPaperPlane />
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}