/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SliderState = {
  sliders: any[];
  collections: any[];
  setSliders: (sliders: any[]) => void;
  setCollections: (collections: any[]) => void;
  addSlider: (slider: any) => void;
  addCollection: (collection: any) => void;
};

export const useSliderStore = create<SliderState>()(
  persist(
    (set) => ({
      sliders: [],
      collections: [],
      setSliders: (sliders) => set({ sliders }),
      setCollections: (collections) => set({ collections }),
      addSlider: (slider) =>
        set((state) => ({ sliders: [...state.sliders, slider] })),
      addCollection: (collection) =>
        set((state) => ({ collections: [...state.collections, collection] })),
    }),
    { name: "slider-storage" }
  )
);
