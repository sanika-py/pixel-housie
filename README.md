# pixel-housie 

A real-time, multiplayer Housie (Tambola) & Bingo game with a retro pixel-art look. Create a room, share the code, and play live with friends — one player draws numbers while everyone else marks their ticket and races to call out winning patterns.

Built with **Next.js**, **Express**, and **Socket.IO** for real-time gameplay.

🔗 **Play online:** [pixel-housie.onrender.com](https://pixel-housie.onrender.com)

## Features

- 🏠 **Room-based multiplayer** — create a room and get a shareable room code, or join an existing one
- 🎮 **Two game modes** — classic **Tambola/Housie** and **Bingo**
- 👑 **Host controls** — the host starts the game and draws numbers; hosting is automatically handed off to another player if the host disconnects
- 🎫 **Auto-generated tickets** — every player gets a unique ticket for the selected mode when the game starts
- 🏆 **Live claims & scoring** — players call out winning patterns as numbers are drawn, claims are verified server-side, and points are awarded in real time
- 📢 **Live broadcasts** — number draws, wins, and room updates are pushed to all players instantly via WebSockets
- 🧑‍🎨 **Player avatars** — pick an avatar to represent you at the table
- 👥 Supports up to **12 players** per room
- 🕹️ Retro **pixel-art** visual theme

## Tech Stack

- [Next.js](https://nextjs.org/) (React 19) — frontend/UI
- [Express](https://expressjs.com/) — custom Node HTTP server
- [Socket.IO](https://socket.io/) — real-time client/server communication
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling and components
- TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (the repo includes a `pnpm-lock.yaml`)

### Installation

```bash
git clone https://github.com/sanika-py/pixel-housie.git
cd pixel-housie
pnpm install
```

### Running locally

```bash
pnpm dev
```

This starts the custom Express + Socket.IO server (which wraps the Next.js app) at [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build
pnpm start
```

## How to Play

1. Open the app and enter your name.
2. **Create a room** to become the host and choose a mode (Tambola or Bingo), or **join a room** using a code shared by a friend.
3. Once everyone has joined, the host starts the game — every player receives a randomly generated ticket.
4. The host draws numbers one at a time; called numbers are broadcast to all players live.
5. Mark off numbers on your ticket as they're called, and claim a pattern as soon as you complete it.
6. Claims are validated automatically — valid claims are announced to the room and award points.
7. Keep playing until all numbers are drawn or all claims are won!

## Project Structure

```
.
├── app/            # Next.js app directory (pages/UI)
├── components/     # Reusable UI components
├── lib/            # Shared client-side utilities
├── public/         # Static assets
├── server/         # Game logic (ticket generation, claim verification, room codes)
├── server.mjs       # Custom Express + Socket.IO server entry point
└── start.mjs        # Production start script
```

## Available Scripts

| Script        | Description                              |
| ------------- | ----------------------------------------- |
| `pnpm dev`    | Run the app in development mode           |
| `pnpm build`  | Build the app for production              |
| `pnpm start`  | Start the production server               |
| `pnpm lint`   | Lint the codebase with ESLint             |

## Contributing

Issues and pull requests are welcome! If you'd like to add features (new claim types, more avatars, additional game modes), feel free to open a PR.

## License

No license has been specified for this repository yet. Please check with the repository owner before reuse.
