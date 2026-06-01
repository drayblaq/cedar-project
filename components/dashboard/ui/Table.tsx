import React from "react";

const C = { muted: "#687a6c", border: "#e6ece4", ink: "#16241a" };

export type Column = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
};

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  renderCell,
}: {
  columns: Column[];
  rows: T[];
  renderCell?: (row: T, key: string) => React.ReactNode;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align ?? "left",
                  padding: "11px 14px",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  color: C.muted, borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="cd-trow">
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "12px 14px",
                    textAlign: col.align ?? "left",
                    borderBottom: `1px solid ${C.border}`,
                    color: C.ink,
                    verticalAlign: "middle",
                  }}
                >
                  {renderCell ? renderCell(row, col.key) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
