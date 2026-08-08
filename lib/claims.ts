export const CLAIM_TYPES = ["firstFive", "firstRow", "middleRow", "lastRow", "fullHouse"] as const

export type ClaimType = (typeof CLAIM_TYPES)[number]

export const CLAIM_META: Record<ClaimType, { label: string; points: number; desc: string }> = {
  firstFive: { label: "First Five", points: 10, desc: "Any 5 numbers" },
  firstRow: { label: "First Row", points: 15, desc: "Top line" },
  middleRow: { label: "Middle Row", points: 15, desc: "Middle line" },
  lastRow: { label: "Last Row", points: 15, desc: "Bottom line" },
  fullHouse: { label: "Full House", points: 40, desc: "Every number" },
}
