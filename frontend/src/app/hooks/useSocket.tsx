"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(path?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_API_URL! + (path || ""), {
      transports: ["websocket"],
    });
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [path]);

  return socket;
}
