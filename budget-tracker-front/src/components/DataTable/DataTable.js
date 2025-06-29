import { useState, useMemo } from "react";
import styles from "./DataTable.module.css";

const DataTable = ({ columns, rows, onDelete, deletingId }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((s) => ({
      key,
      direction: s.key === key && s.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedRows = useMemo(() => {
    const data = [...rows];
    if (sortConfig.key) {
      data.sort((a, b) => {
        let A = a[sortConfig.key];
        let B = b[sortConfig.key];
        if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
        if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [rows, sortConfig]);

  return (
    <div className={styles["data-table-container"]}>
      <table className={styles["data-table"]}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={
                  sortConfig.key === col.key ? styles["sorted"] : undefined
                }
              >
                {col.label}
                {col.sortable && sortConfig.key === col.key
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
            ))}
            {onDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {onDelete && (
                <td>
                  <button
                    className={styles["del-btn"]}
                    disabled={deletingId === row.id}
                    onClick={() => onDelete(row.id)}
                  >
                    {deletingId === row.id ? "…" : "✕"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
