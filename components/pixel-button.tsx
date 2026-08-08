"use client"

import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

type Variant = "lavender" | "mint" | "cream" | "card"

const variants: Record<Variant, string> = {
  lavender: "bg-primary text-primary-foreground",
  mint: "bg-secondary text-secondary-foreground",
  cream: "bg-accent text-accent-foreground",
  card: "bg-card text-card-foreground",
}

export function PixelButton({
  variant = "lavender",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "pixel-btn font-display font-bold uppercase tracking-wide",
        "px-5 py-3 text-base leading-none disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
