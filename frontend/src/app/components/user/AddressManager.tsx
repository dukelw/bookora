"use client";

import { useEffect, useState } from "react";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { FaTrash } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "react-toastify";
import { addressService } from "@/services/addressService";
import AddressFormModal from "./AddressFormModal";
import { useTranslations } from "use-intl";

export default function AddressManager() {
    const t = useTranslations("user");

    const [addresses, setAddresses] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAddresses = async () => {
        try {
            const res = await addressService.getAddresses();
            const { addresses = [], shippingAddress } = res;
            const sorted = [
                ...(shippingAddress ? [{ addressLine1: shippingAddress, isDefault: true }] : []),
                ...addresses
                .filter((a: any) => a !== shippingAddress)
                .map((a: any) => ({ addressLine1: a, isDefault: false })),
            ];
            setAddresses(sorted);
        } catch (err) {
            console.error(err);
            toast.error(t("loadErrorAddress"));
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [t]);

    const handleCreate = async (data: any) => {
        try {
            await addressService.changeShippingAddress(data);
            toast.success(t("createSuccess"));
            await fetchAddresses();
        } catch {
            toast.error(t("createError"));
        }
    };

    const handleDelete = async (addr: any) => {
        if (!confirm(t("deleteConfirm"))) return;
        try {
            await addressService.removeAddress(addr.addressLine1);
            toast.success(t("deleteSuccess"));
            await fetchAddresses();
        } catch {
            toast.error(t("deleteError"));
        }
    };

    return (
        <div className={`${addresses.length === 0 ? "space-y-2" : "space-y-4"}`}>
            <div className="grid gap-4">
                {addresses.map((addr, idx) => (
                <div key={idx} className={`border rounded-lg p-4 transition ${ addr.isDefault ? "border-green-500 bg-green-50/50" : "border-gray-200 hover:shadow-sm" }`}>
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900">{addr.isDefault ? t("shippingAddress") : t("otherAddress")}</p>
                        <Dropdown
                            inline
                            label={<HiOutlineDotsVertical className="text-gray-600 text-xl cursor-pointer" />}
                            arrowIcon={false}
                            className="text-sm"
                        >
                            <DropdownItem onClick={() => handleDelete(addr)} className="text-red-600">
                                <FaTrash size={16} />
                            </DropdownItem>
                        </Dropdown>
                    </div>

                    <div className="text-gray-700 mt-2 leading-relaxed">
                        {addr.addressLine1}
                        {addr.ward ? `, ${addr.ward}` : ""}
                        {addr.district ? `, ${addr.district}` : ""}
                        {addr.province ? `, ${addr.province}` : ""}
                    </div>
                </div>
                ))}
            </div>
            <div className="flex justify-center items-center">
                <Button color="light" className={`w-full p-4 ${ addresses.length === 0 ? "mt-0" : "mt-4" } border border-dashed rounded-lg transition border-green-500 focus:ring-green-50/50 hover:bg-green-50/50`} onClick={() => setIsModalOpen(true)}>{t("addNew")}</Button>
            </div>
            <AddressFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
}