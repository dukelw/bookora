"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import { FaUser, FaCamera, FaEdit, FaSave } from "react-icons/fa";
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
      const hasChanged =
        profile.name !== originalProfile.name ||
        profile.phone !== originalProfile.phone ||
        profile.avatar !== originalProfile.avatar ||
        profile.address !== originalProfile.address ||
        profile.shippingAddress !== originalProfile.shippingAddress;
      if (!hasChanged) {
        toast.info(t("noChanges"));
        return;
      }
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
    <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center space-y-2 relative">
      <div className="relative w-48 h-48">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-48 h-48 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border border-gray-300">
            <FaUser className="w-30 h-30" />
          </div>
        )}
        {isEditing && (
          <>
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-gray-500 text-white rounded-full p-2 cursor-pointer border-2 border-white hover:bg-gray-500 flex items-center justify-center"
            >
              <FaCamera className="h-5 w-5" />
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () =>
                  setProfile({ ...profile, avatar: reader.result as string });
                reader.readAsDataURL(file);
              }}
            />
          </>
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
          color="green"
          className="w-full mt-8 flex items-center justify-center space-x-2"
          onClick={handleButtonClick}
          disabled={saving}
        >
          {isEditing ? (
            saving ? (
              <Spinner size="sm" />
            ) : (
              <FaSave className="h-5 w-5" />
            )
          ) : (
            <FaEdit className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}