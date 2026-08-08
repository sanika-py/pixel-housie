"use client"

import { useGame } from "@/lib/game-store"
import { PixelSprite } from "@/components/pixel-sprite"
import { cn } from "@/lib/utils"

export function Scoreboard() {
  const { room, playerId } = useGame()
  if (!room) return null

  const ranked = [...room.players].sort((a, b) => b.score - a.score)

  return (
    <div className="pixel-box bg-card p-4">
      <p className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Scores
      </p>
      <ol className="flex flex-col gap-2">
        {ranked.map((p, i) => {
          const isMe = p.id === playerId
          return (
            <li
              key={p.id}
              className={cn(
                "pixel-box-sm flex items-center gap-3 px-2 py-1.5",
                isMe ? "bg-secondary" : "bg-background",
              )}
            >
              <span className="w-5 font-display text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <PixelSprite avatarId={p.avatarId} size={28} />
              <span className="flex-1 truncate font-display text-sm font-bold text-slate">
                {isMe ? `${p.name} (you)` : p.name}
              </span>
              <span className="font-display text-base font-extrabold text-primary">{p.score}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
