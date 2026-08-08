import { createServer } from "node:http"
import express from "express"
import next from "next"
import { Server as SocketServer } from "socket.io"
import {
  makeRoomCode,
  generateTicket,
  maxNumberFor,
  verifyClaim,
  CLAIM_TYPES,
  CLAIM_META,
} from "./server/game.mjs"

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = Number.parseInt(process.env.PORT || "3000", 10)

const nextApp = next({ dev, hostname, port })
const handle = nextApp.getRequestHandler()

/* ============================ room state ============================ */

/**
 * rooms: Map<roomId, Room>
 * Room = {
 *   id, mode, status: 'lobby'|'playing', hostId,
 *   players: Map<socketId, Player>,
 *   called: number[],
 *   calledSet: Set<number>,
 *   claims: { [claimType]: { playerId, playerName, avatarId, points } }
 * }
 * Player = { id, name, avatarId, isHost, score, ticket }
 */
const rooms = new Map()

function publicRoom(room) {
  return {
    id: room.id,
    mode: room.mode,
    status: room.status,
    hostId: room.hostId,
    maxNumber: maxNumberFor(room.mode),
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      avatarId: p.avatarId,
      isHost: p.id === room.hostId,
      score: p.score,
    })),
    called: room.called,
    claims: room.claims,
  }
}

function emitRoom(io, room) {
  io.to(room.id).emit("roomUpdate", publicRoom(room))
}

/* ============================ next + http ============================ */

async function main() {
  await nextApp.prepare()

  const app = express()
  const httpServer = createServer(app)

  const io = new SocketServer(httpServer, {
    cors: { origin: "*" },
    addTrailingSlash: false,
    // don't kill non-socket.io upgrades (e.g. Next.js HMR websocket)
    destroyUpgrade: false,
  })

  // Route only Next.js internal upgrades (HMR) to Next; socket.io handles its own.
  // getUpgradeHandler must be called after prepare().
  const nextUpgrade = nextApp.getUpgradeHandler()
  httpServer.on("upgrade", (req, socket, head) => {
    if ((req.url || "").startsWith("/_next")) {
      nextUpgrade(req, socket, head)
    }
  })

  /* ------------------------- socket handlers ------------------------- */
  io.on("connection", (socket) => {
    const getRoom = () => rooms.get(socket.data.roomId)

    socket.on("createRoom", ({ name, mode }, cb) => {
      const cleanName = String(name || "Player").slice(0, 16).trim() || "Player"
      const cleanMode = mode === "bingo" ? "bingo" : "tambola"
      let roomId = makeRoomCode()
      while (rooms.has(roomId)) roomId = makeRoomCode()

      const room = {
        id: roomId,
        mode: cleanMode,
        status: "lobby",
        hostId: socket.id,
        players: new Map(),
        called: [],
        calledSet: new Set(),
        claims: {},
      }
      room.players.set(socket.id, {
        id: socket.id,
        name: cleanName,
        avatarId: "gamer",
        isHost: true,
        score: 0,
        ticket: null,
      })
      rooms.set(roomId, room)

      socket.data.roomId = roomId
      socket.join(roomId)

      cb?.({ ok: true, roomId, playerId: socket.id, room: publicRoom(room) })
      emitRoom(io, room)
    })

    socket.on("joinRoom", ({ roomId, name }, cb) => {
      const id = String(roomId || "").toUpperCase().trim()
      const room = rooms.get(id)
      if (!room) return cb?.({ ok: false, error: "Room not found. Check the code." })
      if (room.status === "playing")
        return cb?.({ ok: false, error: "Game already in progress." })
      if (room.players.size >= 12)
        return cb?.({ ok: false, error: "Room is full (max 12)." })

      const cleanName = String(name || "Player").slice(0, 16).trim() || "Player"
      room.players.set(socket.id, {
        id: socket.id,
        name: cleanName,
        avatarId: "gamer",
        isHost: false,
        score: 0,
        ticket: null,
      })
      socket.data.roomId = id
      socket.join(id)

      cb?.({ ok: true, roomId: id, playerId: socket.id, room: publicRoom(room) })
      emitRoom(io, room)
    })

    socket.on("setAvatar", ({ avatarId }) => {
      const room = getRoom()
      if (!room) return
      const player = room.players.get(socket.id)
      if (!player) return
      player.avatarId = String(avatarId || "gamer")
      emitRoom(io, room)
    })

    socket.on("startGame", () => {
      const room = getRoom()
      if (!room || room.hostId !== socket.id) return
      room.status = "playing"
      room.called = []
      room.calledSet = new Set()
      room.claims = {}
      for (const player of room.players.values()) {
        player.score = 0
        player.ticket = generateTicket(room.mode)
        io.to(player.id).emit("ticket", { ticket: player.ticket, mode: room.mode })
      }
      io.to(room.id).emit("gameStarted", { mode: room.mode })
      emitRoom(io, room)
    })

    socket.on("drawNumber", (_payload, cb) => {
      const room = getRoom()
      if (!room || room.hostId !== socket.id || room.status !== "playing") return
      const max = maxNumberFor(room.mode)
      const remaining = []
      for (let n = 1; n <= max; n++) if (!room.calledSet.has(n)) remaining.push(n)
      if (remaining.length === 0) {
        cb?.({ ok: false, done: true })
        return
      }
      const number = remaining[Math.floor(Math.random() * remaining.length)]
      room.calledSet.add(number)
      room.called.push(number)
      io.to(room.id).emit("numberCalled", { number, called: room.called })
      emitRoom(io, room)
      cb?.({ ok: true, number })
    })

    socket.on("claim", ({ claim }, cb) => {
      const room = getRoom()
      if (!room || room.status !== "playing") return cb?.({ ok: false })
      if (!CLAIM_TYPES.includes(claim)) return cb?.({ ok: false })
      if (room.claims[claim]) return cb?.({ ok: false, taken: true })

      const player = room.players.get(socket.id)
      if (!player || !player.ticket) return cb?.({ ok: false })

      const valid = verifyClaim(player.ticket, room.mode, room.calledSet, claim)
      if (!valid) {
        cb?.({ ok: true, valid: false })
        socket.emit("claimRejected", { claim })
        return
      }

      const points = CLAIM_META[claim].points
      player.score += points
      room.claims[claim] = {
        playerId: player.id,
        playerName: player.name,
        avatarId: player.avatarId,
        points,
      }
      cb?.({ ok: true, valid: true })
      io.to(room.id).emit("winBroadcast", {
        claim,
        label: CLAIM_META[claim].label,
        playerId: player.id,
        playerName: player.name,
        avatarId: player.avatarId,
        points,
      })
      emitRoom(io, room)
    })

    socket.on("disconnect", () => {
      const room = getRoom()
      if (!room) return
      room.players.delete(socket.id)
      if (room.players.size === 0) {
        rooms.delete(room.id)
        return
      }
      if (room.hostId === socket.id) {
        // promote the next player to host
        const next = room.players.values().next().value
        room.hostId = next.id
        next.isHost = true
      }
      emitRoom(io, room)
    })
  })

  /* --------------------------- next fallthrough --------------------------- */
  app.use((req, res) => handle(req, res))

  httpServer.listen(port, () => {
    console.log(`[v0] Housie server ready on http://${hostname}:${port}`)
  })
}

main().catch((err) => {
  console.error("[v0] server failed to start:", err)
  process.exit(1)
})
