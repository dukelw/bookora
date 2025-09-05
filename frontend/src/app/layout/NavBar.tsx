"use client";

import React from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Navbar() {
  return (
    <header className="h-14 px-4 border-b bg-white shadow-sm flex items-center justify-between">
      <div className="font-semibold text-lg">Dashboard</div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1 border rounded text-sm"
        />
        <LanguageSwitcher />
        <button className="text-sm font-medium hover:underline">Profile</button>
      </div>
    </header>
  );
}
