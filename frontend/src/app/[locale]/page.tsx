/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, setUser, setTokens } = useAuthStore();
  const router = useRouter();
  console.log("User", user);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setTokens(null);
    router.push("/signin");
  };

  return (
    <div className="p-6 space-y-10">
      {user ? (
        <>
          <h1>{user.email}</h1>
          <h1>{user.address}</h1>
          <Image src={user.avatar} width={40} height={40} alt="User" />
          <Button onClick={handleLogout}>Logout</Button>
        </>
      ) : (
        <div className="flex mx-auto items-center justify-center">
          <Button>
            <Link href={"/signin"}>Signin</Link>
          </Button>
          <Button>
            <Link href={"/signup"}>Signup</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
