"use client"

import { useGame } from "@/lib/game-store"
import { PixelSprite } from "@/components/pixel-sprite"

export function WinBanner() {
  const { winBanner } = useGame()
  if (!winBanner) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
      <div className="pixel-box flex flex-col items-center gap-2 bg-card px-8 py-6 animate-banner-in">
        <PixelSprite avatarId={winBanner.avatarId} size={72} />
        <p className="font-display text-xl font-extrabold text-primary">{winBanner.label}!</p>
        <p className="font-display text-base font-bold text-slate">{winBanner.playerName}</p>
        <p className="pixel-box-sm bg-accent px-3 py-0.5 font-display text-sm font-bold text-accent-foreground">
          +{winBanner.points} points
        </p>
      </div>
    </div>
  )
}
