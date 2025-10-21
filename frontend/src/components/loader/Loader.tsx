"use client";

import React from "react";

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export default function Loader({
  message = "Loading...",
  fullscreen = true,
}: LoadingProps) {
  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="flex flex-col items-center gap-4 p-6 bg-neutral-900 rounded-lg shadow-lg">
          <div className="w-12 h-12 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin" />
          <div className="text-white text-sm">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-t-transparent border-cyan-500 rounded-full animate-spin" />
      <div className="text-sm text-white">{message}</div>
    </div>
  );
}
