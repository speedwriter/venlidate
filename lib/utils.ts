import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number) {
  if (score < 50) return "#ef4444"
  if (score < 80) return "#f59e0b"
  return "#22c55e"
}
