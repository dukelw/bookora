"use client";

import { userService } from "@/services/userService";
import { useEffect, useState } from "react";

export const UserInfoCell = ({ userId }: { userId: string }) => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUserById(userId);
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (!userInfo)
    return <span className="text-gray-400 italic">Đang tải...</span>;

  return (
    <div className="flex flex-col">
      <span className="font-medium">{userInfo.name || "Không rõ"}</span>
      <span className="text-sm text-gray-500">{userInfo.email}</span>
    </div>
  );
};
