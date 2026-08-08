"use client"

import { useGame } from "@/lib/game-store"
import { cn } from "@/lib/utils"

export function TicketGrid() {
  const { ticket, marks, room, toggleMark } = useGame()
  if (!ticket || !room) return null

  const called = new Set(room.called)
  const cols = ticket[0].length

  return (
    <div className="pixel-box bg-card p-4">
      <p className="mb-3 text-center font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Your Ticket
      </p>
      <div
        className="mx-auto grid w-fit gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Your ticket"
      >
        {ticket.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`
            if (cell === null) {
              return <div key={key} className="h-9 w-9 bg-muted/50 sm:h-11 sm:w-11" aria-hidden />
            }
            if (cell === "FREE") {
              return (
                <div
                  key={key}
                  className="pixel-box-sm flex h-9 w-9 items-center justify-center bg-secondary font-display text-[9px] font-bold text-secondary-foreground sm:h-11 sm:w-11"
                >
                  FREE
                </div>
              )
            }
            const marked = marks.has(key)
            const isCalled = called.has(cell)
            const canMark = isCalled
            return (
              <button
                key={key}
                onClick={() => canMark && toggleMark(r, c)}
                disabled={!canMark}
                aria-pressed={marked}
                className={cn(
                  "pixel-box-sm flex h-9 w-9 items-center justify-center font-display text-sm font-bold transition-transform sm:h-11 sm:w-11",
                  marked
                    ? "-translate-y-0.5 bg-primary text-primary-foreground"
                    : isCalled
                      ? "animate-pulse bg-accent text-accent-foreground"
                      : "bg-background text-slate",
                  canMark ? "hover:brightness-105 active:translate-y-0.5" : "cursor-default opacity-90",
                )}
              >
                {cell}
              </button>
            )
          }),
        )}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
        Tap a glowing called number to daub it.
      </p>
    </div>
  )
}
