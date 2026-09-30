import React from "react";

// A row of stat blocks with a colored left border accent instead of
// uniform shadowed cards — keeps emphasis on the numbers themselves.
export default function StatStrip({ stats }) {
  return (
    <div className="stat-strip">
      {stats.map((s) => (
        <div className="stat-block" key={s.label} style={{ borderLeftColor: s.color || "#3E7C5C" }}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
          {s.sub && <span className="stat-sub">{s.sub}</span>}
        </div>
      ))}
    </div>
  );
}
