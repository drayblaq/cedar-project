"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStudent } from "@/app/dashboard/actions/index";

export function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteStudent(studentId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/students");
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca",
          borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        }}
      >
        Delete student account
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#b91c1c" }}>
        Permanently delete <strong>{studentName}</strong>? This removes their record, payments, attendance, grades and login. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          style={{
            background: "#b91c1c", color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Deleting…" : "Yes, delete permanently"}
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null); }}
          disabled={pending}
          className="cd-btn-ghost"
        >
          Cancel
        </button>
      </div>
      {error && <p style={{ fontSize: 12.5, color: "#b91c1c", fontWeight: 600 }}>{error}</p>}
    </div>
  );
}
