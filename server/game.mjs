// Shared game engine: ticket generation + claim verification.
// Pure functions, no I/O. Used by the Socket.io server.

/* ----------------------------- utilities ----------------------------- */

function randInt(n) {
  return Math.floor(Math.random() * n)
}

function range(lo, hi) {
  const out = []
  for (let i = lo; i <= hi; i++) out.push(i)
  return out
}

function sample(arr, n) {
  const copy = [...arr]
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(copy.length), 1)[0])
  }
  return out
}

export function makeRoomCode() {
  // 5-char, no ambiguous chars (no 0/O/1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 5; i++) code += chars[randInt(chars.length)]
  return code
}

/* ------------------------- tambola 3x9 ticket ------------------------- */

const TAMBOLA_RANGES = [
  [1, 9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
  [80, 90],
]

function buildTambolaMask(colCounts) {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const mask = Array.from({ length: 3 }, () => Array(9).fill(false))
    const rowSums = [0, 0, 0]
    let ok = true
    for (let c = 0; c < 9; c++) {
      const count = colCounts[c]
      const rows = [0, 1, 2].filter((r) => rowSums[r] < 5)
      if (rows.length < count) {
        ok = false
        break
      }
      // balance: prefer the least-filled rows, break ties randomly
      rows.sort((a, b) => rowSums[a] - rowSums[b] || Math.random() - 0.5)
      const chosen = rows.slice(0, count)
      for (const r of chosen) {
        mask[r][c] = true
        rowSums[r]++
      }
    }
    if (ok && rowSums.every((s) => s === 5)) return mask
  }
  return null
}

export function generateTambolaTicket() {
  let colCounts
  // each column gets 1..3 numbers, total 15
  colCounts = Array(9).fill(1)
  let remaining = 6
  while (remaining > 0) {
    const c = randInt(9)
    if (colCounts[c] < 3) {
      colCounts[c]++
      remaining--
    }
  }

  let mask = buildTambolaMask(colCounts)
  // Extremely rare failure -> retry with a fresh distribution
  while (!mask) {
    colCounts = Array(9).fill(1)
    let rem = 6
    while (rem > 0) {
      const c = randInt(9)
      if (colCounts[c] < 3) {
        colCounts[c]++
        rem--
      }
    }
    mask = buildTambolaMask(colCounts)
  }

  const grid = Array.from({ length: 3 }, () => Array(9).fill(null))
  for (let c = 0; c < 9; c++) {
    const [lo, hi] = TAMBOLA_RANGES[c]
    const nums = sample(range(lo, hi), colCounts[c]).sort((a, b) => a - b)
    const filledRows = []
    for (let r = 0; r < 3; r++) if (mask[r][c]) filledRows.push(r)
    filledRows.forEach((r, i) => {
      grid[r][c] = nums[i]
    })
  }
  return grid // 3x9, numbers or null
}

/* --------------------------- bingo 5x5 card --------------------------- */

const BINGO_RANGES = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
]

export function generateBingoCard() {
  const grid = Array.from({ length: 5 }, () => Array(5).fill(null))
  for (let c = 0; c < 5; c++) {
    const [lo, hi] = BINGO_RANGES[c]
    const nums = sample(range(lo, hi), 5)
    for (let r = 0; r < 5; r++) grid[r][c] = nums[r]
  }
  grid[2][2] = "FREE"
  return grid
}

export function generateTicket(mode) {
  return mode === "bingo" ? generateBingoCard() : generateTambolaTicket()
}

/* --------------------------- max drawn number ------------------------- */

export function maxNumberFor(mode) {
  return mode === "bingo" ? 75 : 90
}

/* --------------------------- claim verification ----------------------- */

// Flatten actual numbers (ignore null / FREE) of a ticket row.
function rowNumbers(row) {
  return row.filter((v) => typeof v === "number")
}

function allNumbers(grid) {
  const out = []
  for (const row of grid) for (const v of row) if (typeof v === "number") out.push(v)
  return out
}

// rowIndexForClaim maps claim -> ticket row index depending on mode.
function claimRowIndex(mode, claim) {
  if (mode === "bingo") {
    if (claim === "firstRow") return 0
    if (claim === "middleRow") return 2
    if (claim === "lastRow") return 4
  } else {
    if (claim === "firstRow") return 0
    if (claim === "middleRow") return 1
    if (claim === "lastRow") return 2
  }
  return -1
}

/**
 * Verify a claim against the numbers actually called.
 * @param {number[][]} grid  the player's ticket
 * @param {string} mode  "tambola" | "bingo"
 * @param {Set<number>} called  set of called numbers
 * @param {string} claim  firstFive | firstRow | middleRow | lastRow | fullHouse
 * @returns {boolean}
 */
export function verifyClaim(grid, mode, called, claim) {
  const isCalled = (n) => called.has(n)

  if (claim === "firstFive") {
    const marked = allNumbers(grid).filter(isCalled)
    return marked.length >= 5
  }

  if (claim === "fullHouse") {
    const nums = allNumbers(grid)
    return nums.length > 0 && nums.every(isCalled)
  }

  const ri = claimRowIndex(mode, claim)
  if (ri < 0) return false
  const nums = rowNumbers(grid[ri])
  return nums.length > 0 && nums.every(isCalled)
}

export const CLAIM_TYPES = ["firstFive", "firstRow", "middleRow", "lastRow", "fullHouse"]

export const CLAIM_META = {
  firstFive: { label: "First Five", points: 10, desc: "Mark any 5 numbers" },
  firstRow: { label: "First Row", points: 15, desc: "Complete the top line" },
  middleRow: { label: "Middle Row", points: 15, desc: "Complete the middle line" },
  lastRow: { label: "Last Bottom", points: 15, desc: "Complete the bottom line" },
  fullHouse: { label: "Full House", points: 40, desc: "Mark every number" },
}
