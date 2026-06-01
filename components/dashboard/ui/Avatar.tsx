const PALETTE = ["#2ea82a", "#1a6b18", "#d4a843", "#3f7d8c", "#8c6a3f", "#6a8c3f"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: avatarColor(name), color: "#fff", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.36, letterSpacing: "0.02em",
      }}
    >
      {initials(name)}
    </div>
  );
}
