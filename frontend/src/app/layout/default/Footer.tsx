"use client";

import { Footer, FooterTitle, FooterCopyright, FooterLinkGroup } from "flowbite-react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaPaperPlane } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const AppFooter = () => {
  const t = useTranslations("footer");
  return (
    <Footer className="bg-[#111] text-gray-300">
      <div className="w-full">
        <div className="grid w-full grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto">
          <div>
            {/* Logo & Slogan */}
            <div className="flex flex-col items-center text-center mb-4">
              <Image
                src="/images/logo/variant-rectangle-logo.jpeg"
                alt="Bookora Logo"
                width={240}
                height={60}
                className="h-[60px] w-auto mb-3"
              />
              <p className="text-sm">{t("slogan")}</p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:bookora@gmail.com" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <FaEnvelope className="text-cyan" /> bookora@gmail.com
              </a>
              <a href="tel:0324782904" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <FaPhone className="text-cyan" /> +84 324 782 904
              </a>
              <a
                href="https://www.google.com/maps/place/Broadway+%26+Morris+St,+New+York"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-cyan transition-colors"
              >
                <FaMapMarkerAlt className="text-cyan" />
                Broadway and Morris St, New York
              </a>
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <FooterTitle title={t("recentPosts")} className="text-white mb-4" />
            <FooterLinkGroup col>
              <Link href="#">Top 10 Must-Read Novels in 2025</Link>
              <span className="text-xs text-gray-400">Jan 5, 2025</span>

              <Link href="#">Why Reading Every Day Changes Your Life</Link>
              <span className="text-xs text-gray-400">Dec 20, 2024</span>

              <Link href="#">5 Books to Boost Your Productivity</Link>
              <span className="text-xs text-gray-400">Dec 1, 2024</span>
            </FooterLinkGroup>
          </div>


          {/* Newsletter */}
          <div>
            <FooterTitle
              title={t("newsletterTitle")}
              className="text-white mb-4"
            />
            <p className="text-sm text-gray-400 mb-4">
              {t("newsletterDesc")}
            </p>
            <form className="space-y-3">
              {/* Name input */}
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan" />
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full pl-10 pr-3 py-2 rounded border border-gray-700 bg-gray-900 text-white placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-cyan focus:ring-0"
                />
              </div>

              {/* Email input */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 rounded border border-gray-700 bg-gray-900 text-white placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-cyan focus:ring-0"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-cyan-500 text-black py-2 rounded flex justify-center items-center gap-2 hover:bg-cyan-400 transition"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>

          {/* Instagram */}
          <div>
            <FooterTitle title={t("instagramTitle")} className="text-white mb-4" />
            <p className="text-sm text-gray-400 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Image
                  key={i}
                  src={`/images/insta/insta-${i + 1}.jpg`}
                  alt={`Instagram ${i}`}
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-800 py-4">
          <FooterCopyright by="Bookora Bookstore. All rights reserved." year={2025} />
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;