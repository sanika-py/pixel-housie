"use client"

import { useGame } from "@/lib/game-store"
import { CallerBoard } from "@/components/caller-board"
import { TicketGrid } from "@/components/ticket-grid"
import { ClaimsPanel } from "@/components/claims-panel"
import { Scoreboard } from "@/components/scoreboard"
import { WinBanner } from "@/components/win-banner"
import { GameToast } from "@/components/game-toast"
import { playClick } from "@/lib/sound"

export function GameBoard() {
  const { room, leaveRoom } = useGame()
  if (!room) return null

  const modeLabel = room.mode === "bingo" ? "Bingo 5×5" : "Tambola 3×9"

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4">
      <WinBanner />
      <GameToast />

      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            playClick()
            leaveRoom()
          }}
          className="pixel-box-sm bg-card px-3 py-2 font-display text-xs font-bold uppercase text-slate"
        >
          Leave
        </button>
        <h1 className="font-display text-xl font-extrabold text-primary sm:text-2xl">
          Pixel Housie
        </h1>
        <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {modeLabel} · {room.id}
        </span>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
        <div className="order-2 lg:order-1">
          <CallerBoard />
        </div>
        <div className="order-1 lg:order-2">
          <TicketGrid />
        </div>
        <div className="order-3 flex flex-col gap-4 lg:order-3">
          <ClaimsPanel />
          <Scoreboard />
        </div>
      </div>
    </div>
  )
}
