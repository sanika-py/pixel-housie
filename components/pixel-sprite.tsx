import { getAvatar, PALETTE } from "@/lib/avatars"

export function PixelSprite({
  avatarId,
  size = 96,
  className = "",
}: {
  avatarId: string
  size?: number
  className?: string
}) {
  const avatar = getAvatar(avatarId)
  const cols = Math.max(...avatar.rows.map((r) => r.length))
  const cell = size / cols

  return (
    <div
      className={className}
      style={{ width: size, height: cell * avatar.rows.length }}
      role="img"
      aria-label={avatar.name}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {avatar.rows.map((row, r) => (
          <div key={r} style={{ display: "flex", height: cell }}>
            {row.split("").map((ch, c) => (
              <div
                key={c}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: PALETTE[ch] ?? "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
