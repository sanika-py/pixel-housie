"use client"

import { useGame } from "@/lib/game-store"

export function GameToast() {
  const { toast } = useGame()
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="pixel-box-sm bg-destructive px-4 py-2 font-display text-sm font-bold text-destructive-foreground animate-pixel-pop">
        {toast}
      </div>
    </div>
  )
}
