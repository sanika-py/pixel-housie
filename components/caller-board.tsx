"use client"

import { useGame } from "@/lib/game-store"
import { PixelButton } from "@/components/pixel-button"
import { playClick } from "@/lib/sound"
import { cn } from "@/lib/utils"

export function CallerBoard() {
  const { room, isHost, drawNumber } = useGame()
  if (!room) return null

  const called = room.called
  const current = called.length ? called[called.length - 1] : null
  const calledSet = new Set(called)
  const allDrawn = called.length >= room.maxNumber
  const numbers = Array.from({ length: room.maxNumber }, (_, i) => i + 1)

  return (
    <div className="pixel-box flex flex-col gap-4 bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Last Call
          </p>
          <div
            key={current ?? "none"}
            className="pixel-box-sm mt-1 flex h-16 w-16 items-center justify-center bg-primary text-primary-foreground animate-pixel-pop"
          >
            <span className="font-display text-2xl font-extrabold">{current ?? "--"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Drawn
          </p>
          <p className="font-display text-lg font-extrabold text-slate">
            {called.length}/{room.maxNumber}
          </p>
        </div>
      </div>

      {isHost ? (
        <PixelButton
          variant="cream"
          className="w-full"
          disabled={allDrawn}
          onClick={() => {
            playClick()
            drawNumber()
          }}
        >
          {allDrawn ? "All Drawn" : "Draw Number"}
        </PixelButton>
      ) : (
        <p className="pixel-box-sm bg-muted py-2 text-center font-display text-xs font-bold uppercase text-slate">
          Host is calling
        </p>
      )}

      <div>
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Board
        </p>
        <div className="grid grid-cols-10 gap-1">
          {numbers.map((n) => {
            const done = calledSet.has(n)
            const isCurrent = n === current
            return (
              <div
                key={n}
                className={cn(
                  "flex aspect-square items-center justify-center font-display text-[9px] font-bold sm:text-[10px]",
                  isCurrent
                    ? "pixel-box-sm bg-primary text-primary-foreground"
                    : done
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted/60 text-muted-foreground",
                )}
              >
                {n}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
