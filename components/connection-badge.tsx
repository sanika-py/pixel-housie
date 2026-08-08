"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-store"
import { cn } from "@/lib/utils"

export function ConnectionBadge() {
  const { connected } = useGame()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50">
      <div
        className={cn(
          "pixel-box-sm flex items-center gap-2 bg-card px-3 py-1.5 text-xs font-bold uppercase",
          connected ? "text-slate" : "text-destructive",
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3",
            connected ? "bg-secondary" : "bg-destructive",
          )}
          style={{ boxShadow: "1px 1px 0 0 var(--slate)" }}
        />
        {connected ? "Online" : "Connecting…"}
      </div>
    </div>
  )
}
