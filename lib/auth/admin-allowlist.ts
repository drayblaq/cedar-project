/** Emails allowed for instant / passwordless admin entry (server env only). */
export function parseAdminPasswordlessAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_PASSWORDLESS_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminPasswordlessEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const set = parseAdminPasswordlessAllowlist();
  if (!set) return false;
  return set.has(email.trim().toLowerCase());
}
