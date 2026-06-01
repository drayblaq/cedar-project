"use client";

import React, { useEffect } from "react";

const X_PATH = "M18 6L6 18 M6 6l12 12";

function XIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {X_PATH.split(" M").map((s, i) => <path key={i} d={i === 0 ? s : "M" + s} />)}
    </svg>
  );
}

export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cd-modal-backdrop" onClick={onClose}>
      <div
        className="cd-modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cd-modal-head">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#16241a", letterSpacing: "-0.01em" }}>
              {title}
            </h3>
            {sub && <p style={{ fontSize: 12.5, color: "#687a6c", marginTop: 3 }}>{sub}</p>}
          </div>
          <button
            className="cd-icon-btn"
            onClick={onClose}
            title="Close"
            style={{ flexShrink: 0 }}
          >
            <XIcon />
          </button>
        </div>
        <div className="cd-modal-body">{children}</div>
        {footer && <div className="cd-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
