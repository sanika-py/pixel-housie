"use client"

import { GameProvider, useGame } from "@/lib/game-store"
import { HomeScreen } from "@/components/home-screen"
import { AvatarSetup } from "@/components/avatar-setup"
import { WaitingLobby } from "@/components/waiting-lobby"
import { GameBoard } from "@/components/game-board"
import { ConnectionBadge } from "@/components/connection-badge"

function ScreenRouter() {
  const { screen } = useGame()
  return (
    <main className="pixel-grid-bg min-h-dvh w-full">
      <ConnectionBadge />
      {screen === "home" && <HomeScreen />}
      {screen === "setup" && <AvatarSetup />}
      {screen === "lobby" && <WaitingLobby />}
      {screen === "game" && <GameBoard />}
    </main>
  )
}

export default function Page() {
  return (
    <GameProvider>
      <ScreenRouter />
    </GameProvider>
  )
}
