import { useState } from "react";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";

const S = {
  wrapper: {
    width:        "100%",
    overflowX:    "auto",
    borderRadius: 12,
    border:       "1px solid var(--border)",
    background:   "var(--surface)",
  },
  table: {
    width:          "100%",
    borderCollapse: "collapse",
    fontFamily:     "'DM Sans', sans-serif",
    fontSize:       13,
  },
  th: (sorted) => ({
    padding:       "10px 14px",
    textAlign:     "left",
    fontSize:      11,
    fontWeight:    600,
    color:         sorted ? "var(--accent)" : "var(--dim)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom:  "1px solid var(--border)",
    whiteSpace:    "nowrap",
    userSelect:    "none",
    cursor:        "pointer",
    background:    "var(--surface)",
  }),
  thInner: {
    display:    "inline-flex",
    alignItems: "center",
    gap:        4,
  },
  sortIcon: (dir) => ({
    fontSize:   10,
    opacity:    dir ? 1 : 0.3,
    color:      "var(--accent)",
  }),
  tr: (clickable, hovered) => ({
    borderBottom: "1px solid var(--border)",
    cursor:       clickable ? "pointer" : "default",
    transition:   "background .1s",
    background:   hovered ? "var(--card)" : "transparent",
  }),
  td: {
    padding:    "11px 14px",
    color:      "var(--text-2)",
    verticalAlign: "middle",
  },
  loadingCell: {
    padding:   "2rem",
    textAlign: "center",
  },
};

function SortIcon({ direction }) {
  if (!direction) return <span style={S.sortIcon(false)}>↕</span>;
  return <span style={S.sortIcon(true)}>{direction === "asc" ? "↑" : "↓"}</span>;
}

function Row({ row, columns, onRowClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      style={S.tr(!!onRowClick, hovered)}
      onClick={() => onRowClick && onRowClick(row)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {columns.map((col) => (
        <td key={col.key} style={{ ...S.td, ...col.tdStyle }}>
          {col.render ? col.render(row) : row[col.key] ?? "—"}
        </td>
      ))}
    </tr>
  );
}

export default function Table({
  columns      = [],
  data         = [],
  loading      = false,
  onRowClick,
  emptyMessage = "Aucun résultat",
  emptyHint,
  keyField     = "id",
}) {
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  }

  const sorted = (() => {
    if (!sortKey || !data) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), "fr", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();

  return (
    <div style={S.wrapper}>
      <table style={S.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={S.th(sortKey === col.key)}
                onClick={() => handleSort(col)}
              >
                <span style={S.thInner}>
                  {col.label}
                  {col.sortable && (
                    <SortIcon direction={sortKey === col.key ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={S.loadingCell}>
                <Spinner size={28} />
              </td>
            </tr>
          ) : !sorted || sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                <EmptyState message={emptyMessage} hint={emptyHint} />
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <Row
                key={row[keyField] ?? Math.random()}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
