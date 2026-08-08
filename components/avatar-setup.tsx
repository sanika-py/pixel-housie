"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-store"
import { AVATARS } from "@/lib/avatars"
import { PixelSprite } from "@/components/pixel-sprite"
import { PixelButton } from "@/components/pixel-button"
import { playClick } from "@/lib/sound"
import { cn } from "@/lib/utils"

export function AvatarSetup() {
  const { room, me, setAvatar, goToLobby, leaveRoom } = useGame()
  const [selected, setSelected] = useState(me?.avatarId || "gamer")

  // Sync selection to server whenever it changes
  useEffect(() => {
    setAvatar(selected)
  }, [selected, setAvatar])

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Room {room?.id} · {room?.mode === "bingo" ? "Bingo 5×5" : "Tambola 3×9"}
          </p>
          <h1 className="font-display text-2xl font-extrabold text-slate sm:text-3xl">
            Pick your avatar
          </h1>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AVATARS.map((a) => {
          const active = selected === a.id
          return (
            <button
              key={a.id}
              onClick={() => {
                playClick()
                setSelected(a.id)
              }}
              className={cn(
                "pixel-box flex flex-col items-center gap-3 p-4 text-center transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-card text-slate",
              )}
              aria-pressed={active}
            >
              <div
                className={cn(
                  "pixel-box-sm flex items-center justify-center p-2",
                  active ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                <PixelSprite avatarId={a.id} size={96} />
              </div>
              <div>
                <div className="font-display text-lg font-bold">{a.name}</div>
                <div
                  className={cn(
                    "text-pretty text-xs font-semibold",
                    active ? "text-primary-foreground/85" : "text-muted-foreground",
                  )}
                >
                  {a.desc}
                </div>
              </div>
              {active && (
                <span className="pixel-box-sm bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                  Selected
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="sticky bottom-4 mt-auto">
        <PixelButton
          className="w-full text-lg"
          onClick={() => {
            playClick()
            goToLobby()
          }}
        >
          Enter Lobby as {AVATARS.find((a) => a.id === selected)?.name}
        </PixelButton>
      </div>
    </div>
  )
}
