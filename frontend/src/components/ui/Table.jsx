import { useState } from "react";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";

const S = {
  wrapper: {
    width:        "100%",
    overflowX:    "auto",
    borderRadius: 12,
    border:       "1px solid #2a2a38",
    background:   "#18181e",
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
    color:         sorted ? "#8b83ff" : "#555470",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom:  "1px solid #2a2a38",
    whiteSpace:    "nowrap",
    userSelect:    "none",
    cursor:        "pointer",
    background:    "#18181e",
  }),
  thInner: {
    display:    "inline-flex",
    alignItems: "center",
    gap:        4,
  },
  sortIcon: (dir) => ({
    fontSize:   10,
    opacity:    dir ? 1 : 0.3,
    color:      "#8b83ff",
  }),
  tr: (clickable, hovered) => ({
    borderBottom: "1px solid #2a2a38",
    cursor:       clickable ? "pointer" : "default",
    transition:   "background .1s",
    background:   hovered ? "#1e1e26" : "transparent",
  }),
  td: {
    padding:    "11px 14px",
    color:      "#c4c2dc",
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

/**
 * Props:
 *   columns     { key, label, render?, sortable?, tdStyle? }[]
 *   data        array of row objects
 *   loading     boolean
 *   onRowClick  (row) => void   — optional, makes rows clickable
 *   emptyMessage string
 *   emptyHint    string
 *   keyField    string          — field used as React key (default "id")
 */
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
