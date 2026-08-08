// Pixel voxel avatar definitions. Each sprite is a list of 12-char rows.
// Characters map to a shared color palette below.

export const PALETTE: Record<string, string> = {
  ".": "transparent",
  K: "#3a3550", // dark slate outline / shades
  B: "#2b2833", // near-black hair / mustache
  S: "#e8b78f", // skin
  s: "#d69f72", // skin shadow
  W: "#f6f2fb", // white / silver / kurta
  G: "#c9c3d8", // silver-grey hair
  L: "#c3b3f2", // lavender
  M: "#9fe3c4", // mint
  Y: "#f2dd8f", // cream yellow
  D: "#6b83b0", // denim
  P: "#e79ab5", // pink
  O: "#e0a94e", // gold earrings / accents
  R: "#a76a4a", // brown vest
  T: "#5aa9e6", // teal
}

export type AvatarDef = {
  id: string
  name: string
  desc: string
  rows: string[]
}

export const AVATARS: AvatarDef[] = [
  {
    id: "dadi",
    name: "Desi Dadi",
    desc: "Silver hair bun, spectacles & a soft pastel saree.",
    rows: [
      "...GGGGGG...",
      "..GGGGGGGG..",
      ".GGGGGGGGGG.",
      ".GGSSSSSSGG.",
      ".GSSSSSSSSG.",
      ".GSKKSSKKSG.",
      ".GSSSSSSSSG.",
      ".GSSSPPSSSG.",
      "..SSSSSSSS..",
      ".LLLLLLLLLL.",
      "LLLLLLLLLLLL",
      "LLLLLYYYYLLL",
    ],
  },
  {
    id: "chacha",
    name: "Desi Chacha",
    desc: "Thick blocky mustache, white kurta & a retro vest.",
    rows: [
      "....GGGG....",
      "..GGGGGGGG..",
      ".GGGGGGGGGG.",
      ".GSSSSSSSSG.",
      ".SSSSSSSSSS.",
      ".SSKSSSSKSS.",
      ".SSSSSSSSSS.",
      ".SBBBBBBBBS.",
      "..SSSSSSSS..",
      ".WWWWWWWWWW.",
      "WWRRWWWWRRWW",
      "WWRRWWWWRRWW",
    ],
  },
  {
    id: "kudi",
    name: "Baddie Desi Kudi",
    desc: "Pixel sunglasses, hoop earrings & a trendy fusion fit.",
    rows: [
      "..BBBBBBBB..",
      ".BBBBBBBBBB.",
      "BBBBBBBBBBBB",
      "BBSSSSSSSSBB",
      "BSSSSSSSSSSB",
      "BSKKKKKKKKSB",
      "OSSSSSSSSSSO",
      ".SSSSPPSSSS.",
      "..SSSSSSSS..",
      ".PPPPPPPPPP.",
      "PPPPPPPPPPPP",
      "PPPPLLLLPPPP",
    ],
  },
  {
    id: "munda",
    name: "Cool Desi Munda",
    desc: "Blocky denim jacket, pixel shades & styled-up hair.",
    rows: [
      "...BBBBBB...",
      "..BBBBBBBB..",
      ".BBBBBBBBBB.",
      ".BBSSSSSSBB.",
      ".SSSSSSSSSS.",
      ".SKKKSSKKKS.",
      ".SSSSSSSSSS.",
      ".SSSSBBSSSS.",
      "..SSSSSSSS..",
      ".DDDDDDDDDD.",
      "DDDWWWWDDDDD",
      "DDDWWWWDDDDD",
    ],
  },
  {
    id: "gamer",
    name: "Classic Pixel Gamer",
    desc: "Simple blocky buddy rocking a pair of headphones.",
    rows: [
      "..TTTTTTTT..",
      ".TMMMMMMMMT.",
      "TTMMMMMMMMTT",
      "TTMMMMMMMMTT",
      ".MMMMMMMMMM.",
      ".MMKKMMKKMM.",
      ".MMMMMMMMMM.",
      ".MMMKKKKMMM.",
      "..MMMMMMMM..",
      ".YYYYYYYYYY.",
      "YYYYYYYYYYYY",
      "YYYYYTTYYYYY",
    ],
  },
]

export const AVATAR_MAP: Record<string, AvatarDef> = Object.fromEntries(
  AVATARS.map((a) => [a.id, a]),
)

export function getAvatar(id: string | undefined | null): AvatarDef {
  return (id && AVATAR_MAP[id]) || AVATARS[4]
}
