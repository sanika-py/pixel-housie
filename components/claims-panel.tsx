"use client"

import { useGame } from "@/lib/game-store"
import { CLAIM_TYPES, CLAIM_META } from "@/lib/claims"
import { playClick } from "@/lib/sound"
import { cn } from "@/lib/utils"

export function ClaimsPanel() {
  const { room, claim, playerId } = useGame()
  if (!room) return null

  return (
    <div className="pixel-box bg-card p-4">
      <p className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Claims
      </p>
      <ul className="flex flex-col gap-2">
        {CLAIM_TYPES.map((type) => {
          const meta = CLAIM_META[type]
          const winner = room.claims[type]
          const takenByMe = winner?.playerId === playerId
          return (
            <li key={type}>
              <button
                onClick={() => {
                  if (winner) return
                  playClick()
                  claim(type)
                }}
                disabled={!!winner}
                className={cn(
                  "pixel-box-sm flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-transform",
                  winner
                    ? takenByMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground opacity-85"
                    : "bg-accent text-accent-foreground hover:-translate-y-0.5 active:translate-y-0.5",
                )}
              >
                <span className="flex flex-col">
                  <span className="font-display text-sm font-bold">{meta.label}</span>
                  <span className="text-xs font-semibold leading-tight opacity-85">
                    {winner ? `Won by ${winner.playerName}` : meta.desc}
                  </span>
                </span>
                <span className="shrink-0 font-display text-sm font-bold">+{meta.points}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
