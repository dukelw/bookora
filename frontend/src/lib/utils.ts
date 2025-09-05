// lib/utils.ts
import { clsx } from "clsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...inputs: any[]) {
  return clsx(...inputs);
}
