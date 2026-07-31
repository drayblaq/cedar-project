"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Inline SVG icon (same paths as the prototype) ────────────────────────────
const PATHS: Record<string, string> = {
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users:       "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet:      "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  check:       "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  award:       "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
  megaphone:   "M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
  calendar:    "M3 4h18v18H3zM3 9h18 M8 2v4 M16 2v4",
  layers:      "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  link:        "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  trend:       "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  doc:         "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6",
  heart:       "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
  user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  logout:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  menu:        "M3 6h18 M3 12h18 M3 18h18",
  x:           "M18 6L6 18 M6 6l12 12",
};

function NavIcon({ name, size = 19 }: { name: string; size?: number }) {
  const d = PATHS[name];
  if (!d) return null;
  const paths = d.split(" M").map((seg, i) => (i === 0 ? seg : "M" + seg));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {paths.map((pd, i) => <path key={i} d={pd} />)}
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type NavItem = { href: string; label: string; iconKey: string };

interface Props {
  items: NavItem[];
  userName: string;
  userRole: string;
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
const AVATAR_COLORS = ["#2ea82a", "#1a6b18", "#d4a843", "#3f7d8c", "#8c6a3f", "#6a8c3f"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SidebarClient({ items, userName, userRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  function isActive(href: string) {
    const roots = ["/admin", "/student", "/staff"];
    if (roots.includes(href)) return pathname === href;
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: "6px 8px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Image src="/logo.png" alt="Cedar" width={34} height={34} style={{ objectFit: "contain", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.25))" }} />
          <span style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.05, letterSpacing: "-0.01em", color: "#fff" }}>
            Cedar <span style={{ color: "#6fdc6a" }}>Training</span><br />Center
          </span>
        </div>
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 16px", borderBottom: "1px solid rgba(255,255,255,.1)", marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: avatarColor(userName), color: "#fff", display: "flex",
          alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
          {initials(userName)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", textTransform: "capitalize" }}>{userRole}</div>
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", padding: "4px 12px 6px" }}>
        Menu
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {items.map(({ href, label, iconKey }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`cd-snav-item${active ? " cd-snav-on" : ""}`}>
              <NavIcon name={iconKey} size={19} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.6)", padding: "6px 12px 10px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6fdc6a", boxShadow: "0 0 0 3px rgba(111,220,106,.2)", flexShrink: 0 }} />
          {userRole}
        </div>
        <button className="cd-snav-item" onClick={handleSignOut}
          style={{ color: "rgba(255,255,255,.55)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ff7f7f")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.55)")}>
          <NavIcon name="logout" size={19} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="cd-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <SidebarContent />
      </aside>

      {/* Mobile: top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        height: 60, background: "#0e3b0c", borderBottom: "1px solid rgba(255,255,255,.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px"
      }} className="cedar-dash md-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="Cedar" width={28} height={28} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Cedar Training</span>
        </div>
        <button onClick={() => setMobileOpen(true)}
          style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8,
            padding: 8, cursor: "pointer", color: "#fff", display: "flex" }}>
          <NavIcon name="menu" size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(14,59,12,.5)", backdropFilter: "blur(3px)" }} />
          <aside style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 51, width: 260,
            background: "#0e3b0c", display: "flex", flexDirection: "column",
            padding: "22px 16px", gap: 4, boxShadow: "4px 0 40px rgba(0,0,0,.4)",
            animation: "cd-slideIn .22s cubic-bezier(.16,1,.3,1)"
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8,
                  padding: 8, cursor: "pointer", color: "#fff", display: "flex" }}>
                <NavIcon name="x" size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
          <style>{`@keyframes cd-slideIn { from { transform: translateX(-100%); } to { transform: none; } }`}</style>
        </>
      )}

      <style>{`
        @media (min-width: 901px) { .md-topbar { display: none !important; } .cd-sidebar { display: flex !important; } }
        @media (max-width: 900px)  { .cd-sidebar { display: none !important; } }
      `}</style>
    </>
  );
}
