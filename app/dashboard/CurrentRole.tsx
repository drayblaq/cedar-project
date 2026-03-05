'use client';

import { useEffect, useState } from"react";
import { createClient } from"@/lib/supabase/client";

export function CurrentRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", user.id)
        .single();
      if (!profile?.role_id) {
        setRole("(no role)");
        setLoading(false);
        return;
      }
      const { data: roleRow } = await supabase
        .from("roles")
        .select("name")
        .eq("id", profile.role_id)
        .single();
      setRole(roleRow?.name ??"(unknown)");
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;
  if (!role) return null;

  return (
    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
      Logged in as: <strong className="text-emerald-600">{role}</strong>
    </span>
  );
}
