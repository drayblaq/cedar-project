'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CurrentRole() {
  const [display, setDisplay] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role_id")
        .eq("id", user.id)
        .single();

      let roleName = "user";
      if (profile?.role_id) {
        const { data: roleRow } = await supabase
          .from("roles")
          .select("name")
          .eq("id", profile.role_id)
          .single();
        roleName = roleRow?.name ?? "user";
      }

      const displayName =
        (profile as { full_name?: string | null } | null)?.full_name?.trim() ||
        user.email ||
        "User";

      setDisplay({ name: displayName, role: roleName });
    }
    load();
  }, []);

  if (!display) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
        {display.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[140px] truncate">
          {display.name}
        </span>
        <span className="text-[10px] font-medium text-emerald-600 capitalize leading-tight">
          {display.role}
        </span>
      </div>
    </div>
  );
}
