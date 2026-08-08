"use client"

import { useState } from "react"
import { useGame, type Mode } from "@/lib/game-store"
import { PixelButton } from "@/components/pixel-button"
import { PixelSprite } from "@/components/pixel-sprite"
import { AVATARS } from "@/lib/avatars"
import { playClick } from "@/lib/sound"
import { cn } from "@/lib/utils"

type Tab = "create" | "join"

export function HomeScreen() {
  const { createRoom, joinRoom, connected } = useGame()
  const [tab, setTab] = useState<Tab>("create")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<Mode>("tambola")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return setError("Enter a nickname first.")
    setBusy(true)
    setError("")
    playClick()
    const res = await createRoom(name.trim(), mode)
    setBusy(false)
    if (!res.ok) setError(res.error || "Something went wrong.")
  }

  async function handleJoin() {
    if (!name.trim()) return setError("Enter a nickname first.")
    if (code.trim().length !== 5) return setError("Room code is 5 characters.")
    setBusy(true)
    setError("")
    playClick()
    const res = await joinRoom(code.trim().toUpperCase(), name.trim())
    setBusy(false)
    if (!res.ok) setError(res.error || "Something went wrong.")
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Title */}
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-end gap-1">
          {AVATARS.slice(0, 5).map((a) => (
            <PixelSprite key={a.id} avatarId={a.id} size={44} />
          ))}
        </div>
        <h1 className="text-balance font-display text-4xl font-extrabold text-slate sm:text-5xl">
          Pixel Housie
        </h1>
        <p className="text-pretty text-sm font-semibold text-muted-foreground">
          Real-time multiplayer Tambola &amp; Bingo. Grab friends, pick a desi voxel avatar, and
          shout Housie!
        </p>
      </header>

      {/* Card */}
      <section className="pixel-box w-full bg-card p-5">
        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {(["create", "join"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setError("")
                playClick()
              }}
              className={cn(
                "pixel-box-sm py-2 font-display text-sm font-bold uppercase tracking-wide",
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-slate",
              )}
            >
              {t === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>

        {/* Nickname (shared) */}
        <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wide text-slate">
          Nickname
        </label>
        <input
          value={name}
          maxLength={16}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className="pixel-box-sm mb-4 w-full bg-background px-3 py-3 text-base font-semibold text-slate outline-none placeholder:text-muted-foreground"
        />

        {tab === "create" ? (
          <>
            <label className="mb-2 block font-display text-xs font-bold uppercase tracking-wide text-slate">
              Game Mode
            </label>
            <div className="mb-5 grid grid-cols-2 gap-2">
              <ModeCard
                active={mode === "tambola"}
                onClick={() => setMode("tambola")}
                title="Tambola"
                sub="3×9 tickets · 1–90"
              />
              <ModeCard
                active={mode === "bingo"}
                onClick={() => setMode("bingo")}
                title="Bingo"
                sub="5×5 cards · 1–75"
              />
            </div>
            <PixelButton
              className="w-full"
              disabled={busy || !connected}
              onClick={handleCreate}
            >
              {busy ? "Creating…" : "Create Room"}
            </PixelButton>
          </>
        ) : (
          <>
            <label className="mb-1 block font-display text-xs font-bold uppercase tracking-wide text-slate">
              Room Code
            </label>
            <input
              value={code}
              maxLength={5}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCDE"
              className="pixel-box-sm mb-5 w-full bg-background px-3 py-3 text-center font-display text-2xl font-extrabold uppercase tracking-[0.3em] text-slate outline-none placeholder:tracking-[0.3em] placeholder:text-muted-foreground"
            />
            <PixelButton
              variant="mint"
              className="w-full"
              disabled={busy || !connected}
              onClick={handleJoin}
            >
              {busy ? "Joining…" : "Join Room"}
            </PixelButton>
          </>
        )}

        {error && (
          <p className="mt-3 text-center text-sm font-bold text-destructive">{error}</p>
        )}
      </section>

      <p className="text-center text-xs font-semibold text-muted-foreground">
        Open this game in a second tab to play against yourself and test multiplayer.
      </p>
    </div>
  )
}

function ModeCard({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean
  onClick: () => void
  title: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pixel-box-sm px-3 py-3 text-left",
        active ? "bg-accent text-accent-foreground" : "bg-muted text-slate",
      )}
    >
      <div className="font-display text-base font-bold">{title}</div>
      <div className="text-xs font-semibold opacity-80">{sub}</div>
    </button>
  )
}
