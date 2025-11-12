"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "flowbite-react";
import { toast } from "react-toastify";
import SingleSelect from "@/components/SingleSelect";
import { useTranslations } from "use-intl";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
}: AddressModalProps) {
  const t = useTranslations("user");

  const [form, setForm] = useState<any>({
    province: "",
    district: "",
    ward: "",
    addressLine1: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => toast.error(t("loadProvinceError")));
  }, [t]);

  useEffect(() => {
    if (!form.province) {
      setDistricts([]);
      setWards([]);
      return;
    }
    fetch(`https://provinces.open-api.vn/api/p/${form.province}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.districts || []);
        setWards([]);
      })
      .catch(() => toast.error(t("loadDistrictError")));
  }, [form.province, t]);

  useEffect(() => {
    if (!form.district) {
      setWards([]);
      return;
    }
    fetch(`https://provinces.open-api.vn/api/d/${form.district}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards || []))
      .catch(() => toast.error(t("loadWardError")));
  }, [form.district, t]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        province: "",
        district: "",
        ward: "",
        addressLine1: "",
      });
      setDistricts([]);
      setWards([]);
    }
  }, [isOpen]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.addressLine1.trim()) {
      toast.warn(t("fillAddressWarn"));
      return;
    }
    const selectedProvince =
      provinces.find((p) => String(p.code) === String(form.province))?.name ||
      "";
    const selectedDistrict =
      districts.find((d) => String(d.code) === String(form.district))?.name ||
      "";
    const selectedWard =
      wards.find((w) => String(w.code) === String(form.ward))?.name || "";
    const fullAddress = `${form.addressLine1}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
    onSubmit({ address: fullAddress });
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="5xl">
      <ModalHeader className="border-gray-200">{t("createTitle")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("province")}
              </label>
              <SingleSelect
                options={provinces}
                value={
                  provinces.find(
                    (p) => String(p.code) === String(form.province)
                  ) || null
                }
                onChange={(selected) => {
                  setForm((prev: any) => ({
                    ...prev,
                    province: selected ? selected.code : "",
                    district: "",
                    ward: "",
                  }));
                }}
                getId={(p) => p.code}
                getLabel={(p) => p.name}
                placeholder={t("selectProvince")}
              />
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("district")}
              </label>
              <SingleSelect
                options={districts}
                value={
                  districts.find(
                    (d) => String(d.code) === String(form.district)
                  ) || null
                }
                onChange={(selected) => {
                  setForm((prev: any) => ({
                    ...prev,
                    district: selected ? selected.code : "",
                    ward: "",
                  }));
                }}
                getId={(d) => d.code}
                getLabel={(d) => d.name}
                placeholder={t("selectDistrict")}
                disabled={!form.province}
              />
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("ward")}
              </label>
              <SingleSelect
                options={wards}
                value={
                  wards.find((w) => String(w.code) === String(form.ward)) ||
                  null
                }
                onChange={(selected) => {
                  setForm((prev: any) => ({
                    ...prev,
                    ward: selected ? selected.code : "",
                  }));
                }}
                getId={(w) => w.code}
                getLabel={(w) => w.name}
                placeholder={t("selectWard")}
                disabled={!form.district}
              />
            </div>
          </div>
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("detailAddress")}
            </label>
            <input
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder={t("detailAddressPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="mt-2 flex justify-end gap-2 w-full">
        <Button onClick={handleSubmit}>{t("create")}</Button>
        <Button color="gray" onClick={onClose}>
          {t("cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
