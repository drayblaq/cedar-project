import React from "react";

export function Card({
  children,
  style = {},
  pad = 22,
  className = "",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
  className?: string;
}) {
  return (
    <div
      className={"cd-card " + className}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}
