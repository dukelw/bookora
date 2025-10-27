"use client";

import React from "react";
import SliderCarousel from "@/app/components/home/Slider";
import { useTranslations } from "use-intl";
import NewArrivalsPage from "./new-arrivals/page";
import BestsellersPage from "./bestsellers/page";
import CategoryPage from "./category/page";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="p-6 flex flex-col items-center min-h-[70vh]">
      {/* Slider nằm ngoài shadow */}
      <div className="w-full mb-10">
        <SliderCarousel />
      </div>

      <div className="flex flex-col w-full gap-16">
        <div className="rounded-2xl shadow-xl">
          <NewArrivalsPage />
        </div>

        <div className="rounded-2xl shadow-xl">
          <BestsellersPage />
        </div>

        <div className="rounded-2xl shadow-xl">
          <CategoryPage />
        </div>
      </div>
    </div>
  );
}
