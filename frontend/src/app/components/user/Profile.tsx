"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { Card, Label, TextInput, Button, Spinner, Select } from "flowbite-react";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";

export default function ProfileForm() {
  const t = useTranslations("user");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    shippingAddress: ""
  });

  const [originalProfile, setOriginalProfile] = useState(profile);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await userService.getProfile();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          address: data.address || "",
          shippingAddress: data.shippingAddress || "",
        });
        setOriginalProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          address: data.address || "",
          shippingAddress: data.shippingAddress || "",
        });
      } catch (err: any) {
        console.error(err);
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleButtonClick = async () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      setSaving(true);
      try {
        await userService.updateProfile({
          name: profile.name,
          phone: profile.phone,
          avatar: profile.avatar,
          address: profile.address,
          shippingAddress: profile.shippingAddress,
        });
        toast.success(t("updateSuccess"));
        setOriginalProfile(profile);
        setIsEditing(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || t("updateError"));
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center md:items-start space-y-2">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-48 h-48 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border border-gray-300 text-center p-2">
            {t("noImage") || "Không có hình ảnh"}
          </div>
        )}
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                setProfile({ ...profile, avatar: reader.result as string });
              };
              reader.readAsDataURL(file);
            }}
          />
        )}
      </div>

      <div className="flex-1 w-full md:w-2/3 space-y-4">
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <TextInput id="email" value={profile.email} disabled />
        </div>
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <TextInput
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <TextInput
            id="phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="address">{t("address")}</Label>
          <TextInput
            id="address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="shippingAddress">{t("shippingAddress")}</Label>
          <TextInput
            id="address"
            value={profile.shippingAddress}
            onChange={(e) => setProfile({ ...profile, shippingAddress: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <Button
          type="button"
          color="blue"
          className="w-full mt-4"
          onClick={handleButtonClick}
          disabled={saving}
        >
          {isEditing ? (saving ? <Spinner size="sm" /> : t("save")) : t("update")}
        </Button>
      </div>
    </div>
  );
}