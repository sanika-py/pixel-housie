"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-store"
import { PixelSprite } from "@/components/pixel-sprite"
import { PixelButton } from "@/components/pixel-button"
import { playClick } from "@/lib/sound"
import { cn } from "@/lib/utils"

export function WaitingLobby() {
  const { room, me, isHost, startGame, leaveRoom } = useGame()
  const [copied, setCopied] = useState(false)

  if (!room) return null

  const copyCode = async () => {
    playClick()
    try {
      await navigator.clipboard.writeText(room.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const modeLabel = room.mode === "bingo" ? "Bingo 5×5 · 1–75" : "Tambola 3×9 · 1–90"

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {modeLabel}
          </p>
          <h1 className="font-display text-2xl font-extrabold text-slate sm:text-3xl">Lobby</h1>
        </div>
        <button
          onClick={() => {
            playClick()
            leaveRoom()
          }}
          className="pixel-box-sm bg-card px-3 py-2 font-display text-xs font-bold uppercase text-slate"
        >
          Leave
        </button>
      </header>

      {/* Room code */}
      <section className="pixel-box flex flex-col items-center gap-3 bg-card p-6">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Room Code
        </p>
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-extrabold tracking-[0.2em] text-primary">
            {room.id}
          </span>
          <button
            onClick={copyCode}
            className="pixel-box-sm bg-accent px-3 py-2 font-display text-xs font-bold uppercase text-accent-foreground"
            aria-label="Copy room code"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-pretty text-center text-sm font-semibold text-muted-foreground">
          Share this code with friends so they can join.
        </p>
      </section>

      {/* Players */}
      <section>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate">
          Players ({room.players.length})
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {room.players.map((p) => (
            <li
              key={p.id}
              className="pixel-box-sm relative flex flex-col items-center gap-2 bg-card p-3"
            >
              {p.isHost && (
                <span className="pixel-box-sm absolute -right-2 -top-2 bg-primary px-2 py-0.5 font-display text-[10px] font-bold uppercase text-primary-foreground">
                  Host
                </span>
              )}
              <PixelSprite avatarId={p.avatarId} size={56} />
              <span className="max-w-full truncate font-display text-sm font-bold text-slate">
                {p.id === me?.id ? `${p.name} (you)` : p.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <div className="sticky bottom-4 mt-auto flex flex-col items-center gap-2">
        {isHost ? (
          <PixelButton
            className="w-full text-lg"
            onClick={() => {
              playClick()
              startGame()
            }}
          >
            Start Game
          </PixelButton>
        ) : (
          <p className="pixel-box-sm w-full bg-card py-3 text-center font-display text-sm font-bold uppercase text-slate">
            <span className="animate-pulse">Waiting for host to start…</span>
          </p>
        )}
      </div>
    </div>
  )
}
