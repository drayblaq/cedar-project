"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type NavItem = { href: string; label: string; iconKey: string };

// ── Icon paths ────────────────────────────────────────────────────────────────
const PATHS: Record<string, string> = {
  grid:      "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users:     "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet:    "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  check:     "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  award:     "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
  megaphone: "M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
  calendar:  "M3 4h18v18H3zM3 9h18 M8 2v4 M16 2v4",
  layers:    "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  link:      "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  heart:     "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
  book:      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  progress:  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 3",
  myClasses: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  myChildren:"M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
  attendance:"M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  grades:    "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
  announcements: "M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
  parentLinks:   "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  overview:  "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  students:  "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  payments:  "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  classes:   "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  doc:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6",
};

function NavIcon({ name, size = 17 }: { name: string; size?: number }) {
  const d = PATHS[name];
  if (!d) return null;
  const paths = d.split(" M").map((s, i) => (i === 0 ? s : "M" + s));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }} aria-hidden="true">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function avatarBg(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }

// ── Component ─────────────────────────────────────────────────────────────────
export function TopNavClient({ items, userName, userRole }: {
  items: NavItem[];
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  function isActive(href: string) {
    // Exact match for root pages so /admin doesn't match /admin/students
    const exactRoots = ["/admin", "/student", "/staff", "/parent"];
    if (exactRoots.includes(href)) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="cedar-topnav">
      <div className="cedar-topnav-inner">
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          <Image src="/logo.png" alt="Cedar" width={30} height={30} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.05, letterSpacing: "-0.01em", color: "#16241a" }}>
            Cedar <span style={{ color: "#2ea82a" }}>Training</span> Center
          </span>
        </Link>

        {/* Horizontal nav */}
        <nav className="cedar-topnav-nav" aria-label="Main navigation">
          {items.map(({ href, label, iconKey }) => (
            <Link
              key={href}
              href={href}
              className={"cedar-tnav-item" + (isActive(href) ? " cedar-tnav-on" : "")}
            >
              <NavIcon name={iconKey} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User + sign-out */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: avatarBg(userName), color: "#fff", display: "flex",
              alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5 }}>
              {initials(userName)}
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#16241a", whiteSpace: "nowrap" }}>{userName}</div>
              <div style={{ fontSize: 11, color: "#687a6c", textTransform: "capitalize" }}>{userRole}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="cedar-icon-btn" title="Sign out">
            <NavIcon name="logout" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
