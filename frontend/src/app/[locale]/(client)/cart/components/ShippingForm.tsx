"use client";
import React from "react";

interface ShippingFormProps {
  formData: any;
  setFormData: (data: any) => void;
  t: (key: string) => string;
}

export default function ShippingForm({
  formData,
  setFormData,
  t,
}: ShippingFormProps) {
  return (
    <form className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={t("placeholderName")}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex-1"
        />
        <input
          type="text"
          placeholder={t("placeholderPhone")}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex-1"
        />
      </div>
      <input
        type="email"
        placeholder={t("placeholderEmail")}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
      />
      <input
        type="text"
        placeholder={t("placeholderAddress")}
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
      />
      <input
        type="text"
        placeholder={t("placeholderCity")}
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
      />
      <textarea
        placeholder={t("placeholderNote")}
        value={formData.note}
        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
        rows={3}
      />
    </form>
  );
}
