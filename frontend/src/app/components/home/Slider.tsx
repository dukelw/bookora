"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel } from "flowbite-react";
import { useSliderStore } from "@/store/sliderStore";
import { sliderService } from "@/services/sliderService";

interface Slider {
  _id: string;
  title: string;
  image: string;
  description?: string;
  collection: any;
}

export default function SliderCarousel() {
  const [activeSliders, setActiveSliders] = useState<Slider[]>([]);

  useEffect(() => {
    const handleGetActiveCollection = async () => {
      const activeCollection = await sliderService.getActiveCollection();
      console.log(activeCollection);
      if (activeCollection) {
        setActiveSliders(activeCollection.sliders);
      }
    };
    handleGetActiveCollection();
  }, []);

  if (activeSliders?.length === 0) return <p>No active sliders</p>;

  return (
    <div className="w-full h-64 md:h-96 relative">
      <Carousel slideInterval={5000}>
        {activeSliders?.map((slider) => (
          <div key={slider._id} className="relative w-full h-full">
            <img
              src={slider.image}
              alt={slider.title}
              className="object-cover rounded-lg w-full h-full"
            />

            <div className="absolute bottom-5 left-5 bg-black/50 p-2 rounded text-white">
              <h3 className="text-lg font-semibold">{slider.title}</h3>
              {slider.description && (
                <p className="text-sm">{slider.description}</p>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
