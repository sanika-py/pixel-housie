"use client"

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { io, type Socket } from "socket.io-client"
import { playCall, playWin, playError, playMark, playUnmark } from "@/lib/sound"

export type Screen = "home" | "setup" | "lobby" | "game"
export type Mode = "tambola" | "bingo"

export type PublicPlayer = {
  id: string
  name: string
  avatarId: string
  isHost: boolean
  score: number
}

export type ClaimInfo = {
  playerId: string
  playerName: string
  avatarId: string
  points: number
}

export type RoomState = {
  id: string
  mode: Mode
  status: "lobby" | "playing"
  hostId: string
  maxNumber: number
  players: PublicPlayer[]
  called: number[]
  claims: Record<string, ClaimInfo>
}

export type WinBanner = {
  claim: string
  label: string
  playerName: string
  avatarId: string
  points: number
}

type Cell = number | "FREE" | null

type GameContextValue = {
  connected: boolean
  screen: Screen
  playerId: string
  room: RoomState | null
  ticket: Cell[][] | null
  marks: Set<string>
  winBanner: WinBanner | null
  toast: string | null
  isHost: boolean
  me: PublicPlayer | null
  createRoom: (name: string, mode: Mode) => Promise<{ ok: boolean; error?: string }>
  joinRoom: (code: string, name: string) => Promise<{ ok: boolean; error?: string }>
  setAvatar: (id: string) => void
  goToLobby: () => void
  startGame: () => void
  drawNumber: () => void
  claim: (type: string) => void
  toggleMark: (r: number, c: number) => void
  leaveRoom: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [screen, setScreen] = useState<Screen>("home")
  const [playerId, setPlayerId] = useState("")
  const [room, setRoom] = useState<RoomState | null>(null)
  const [ticket, setTicket] = useState<Cell[][] | null>(null)
  const [marks, setMarks] = useState<Set<string>>(new Set())
  const [winBanner, setWinBanner] = useState<WinBanner | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const socket = io({ transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("connect", () => {
      setConnected(true)
      setPlayerId(socket.id || "")
    })
    socket.on("disconnect", () => setConnected(false))

    socket.on("roomUpdate", (r: RoomState) => setRoom(r))

    socket.on("ticket", ({ ticket }: { ticket: Cell[][] }) => {
      setTicket(ticket)
      setMarks(new Set())
    })

    socket.on("gameStarted", () => {
      setScreen("game")
    })

    socket.on("numberCalled", ({ called }: { number: number; called: number[] }) => {
      playCall()
      setRoom((prev) => (prev ? { ...prev, called } : prev))
    })

    socket.on("winBroadcast", (b: WinBanner) => {
      playWin()
      setWinBanner(b)
      if (bannerTimer.current) clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setWinBanner(null), 4000)
    })

    socket.on("claimRejected", ({ claim }: { claim: string }) => {
      playError()
      showToast("Not yet! That claim isn't valid.")
    })

    return () => {
      socket.close()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const createRoom = useCallback(
    (name: string, mode: Mode) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const socket = socketRef.current
        if (!socket) return resolve({ ok: false, error: "Not connected." })
        socket.emit("createRoom", { name, mode }, (res: any) => {
          if (res?.ok) {
            setRoom(res.room)
            setPlayerId(res.playerId)
            setScreen("setup")
            resolve({ ok: true })
          } else {
            resolve({ ok: false, error: res?.error || "Could not create room." })
          }
        })
      }),
    [],
  )

  const joinRoom = useCallback(
    (code: string, name: string) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const socket = socketRef.current
        if (!socket) return resolve({ ok: false, error: "Not connected." })
        socket.emit("joinRoom", { roomId: code, name }, (res: any) => {
          if (res?.ok) {
            setRoom(res.room)
            setPlayerId(res.playerId)
            setScreen("setup")
            resolve({ ok: true })
          } else {
            resolve({ ok: false, error: res?.error || "Could not join room." })
          }
        })
      }),
    [],
  )

  const setAvatar = useCallback((id: string) => {
    socketRef.current?.emit("setAvatar", { avatarId: id })
  }, [])

  const goToLobby = useCallback(() => setScreen("lobby"), [])

  const startGame = useCallback(() => {
    socketRef.current?.emit("startGame")
  }, [])

  const drawNumber = useCallback(() => {
    socketRef.current?.emit("drawNumber", {}, () => {})
  }, [])

  const claim = useCallback(
    (type: string) => {
      socketRef.current?.emit("claim", { claim: type }, (res: any) => {
        if (res?.taken) showToast("Someone already claimed that!")
      })
    },
    [showToast],
  )

  const toggleMark = useCallback((r: number, c: number) => {
    const key = `${r}-${c}`
    setMarks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
        playUnmark()
      } else {
        next.add(key)
        playMark()
      }
      return next
    })
  }, [])

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current
    // full reconnect resets server-side membership cleanly
    socket?.disconnect()
    socket?.connect()
    setRoom(null)
    setTicket(null)
    setMarks(new Set())
    setWinBanner(null)
    setScreen("home")
  }, [])

  const me = useMemo(
    () => room?.players.find((p) => p.id === playerId) ?? null,
    [room, playerId],
  )
  const isHost = !!room && room.hostId === playerId

  const value: GameContextValue = {
    connected,
    screen,
    playerId,
    room,
    ticket,
    marks,
    winBanner,
    toast,
    isHost,
    me,
    createRoom,
    joinRoom,
    setAvatar,
    goToLobby,
    startGame,
    drawNumber,
    claim,
    toggleMark,
    leaveRoom,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
