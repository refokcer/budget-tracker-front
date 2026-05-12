import { useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./ManageCategories.module.css";

const DEFAULT_COLOR = "#5FB3A7";

const tabs = [
  { key: "expense", label: "Expense categories", type: 2 },
  { key: "income", label: "Income categories", type: 1 },
  { key: "transfer", label: "Transfer categories", type: 0 },
];

const normalizeColor = (color) =>
  /^#[0-9a-f]{6}$/i.test(color || "") ? color.toUpperCase() : DEFAULT_COLOR;

const ManageCategories = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [descr, setDescr] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const activeType = tabs.find((tab) => tab.key === activeTab)?.type ?? 2;

  const colorUsage = useMemo(() => {
    const usage = new Map();
    allCategories.forEach((category) => {
      const normalized = normalizeColor(category.color);
      if (!usage.has(normalized)) usage.set(normalized, []);
      usage.get(normalized).push(category);
    });
    return usage;
  }, [allCategories]);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, allData] = await Promise.all([
          apiJson(API_ENDPOINTS.manageCategories(activeType), {}, "Failed to load categories"),
          apiJson(API_ENDPOINTS.categories, {}, "Failed to load categories"),
        ]);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setAllCategories(Array.isArray(allData) ? allData : []);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, activeType]);

  const addCategory = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return alert("Enter category name");

    try {
      setLoading(true);
      setError(null);

      const newCat = await apiJson(API_ENDPOINTS.createCategory, {
        method: "POST",
        body: {
          title: trimmedTitle,
          type: activeType,
          description: descr.trim() || null,
          color,
        },
      }, "Failed to create category");
      setCategories((current) => [...current, newCat]);
      setAllCategories((current) => [...current, newCat]);
      setTitle("");
      setDescr("");
      setColor(DEFAULT_COLOR);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const updateColor = async (category, nextColor) => {
    const normalizedColor = normalizeColor(nextColor);
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? { ...item, color: normalizedColor } : item
        )
      );
    setAllCategories((current) =>
      current.map((item) =>
        item.id === category.id ? { ...item, color: normalizedColor } : item
      )
    );

    try {
      setBusyId(category.id);
      const updated = await apiJson(API_ENDPOINTS.updateCategory, {
        method: "PUT",
        body: {
          id: category.id,
          title: category.title,
          type: category.type,
          description: category.description,
          color: normalizedColor,
        },
      }, "Failed to save category color");
      setCategories((current) =>
        current.map((item) => (item.id === category.id ? updated : item))
      );
      setAllCategories((current) =>
        current.map((item) => (item.id === category.id ? updated : item))
      );
    } catch (e) {
      setError(getApiErrorMessage(e));
      setCategories((current) =>
        current.map((item) => (item.id === category.id ? category : item))
      );
      setAllCategories((current) =>
        current.map((item) => (item.id === category.id ? category : item))
      );
    } finally {
      setBusyId(null);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete category?")) return;
    try {
      setBusyId(id);
      await apiFetch(API_ENDPOINTS.deleteCategory(id), {
        method: "DELETE",
      }, "Failed to delete category");
      setCategories((current) => current.filter((item) => item.id !== id));
      setAllCategories((current) => current.filter((item) => item.id !== id));
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={`${styles["modal-content"]} ${styles.large}`}>
        <div className={styles.header}>
          <div>
            <h3>Manage categories</h3>
            <p>Assign colors for analytics. A color can be reused; shared colors are marked.</p>
          </div>
        </div>

        <div className={styles["cat-tabs"]}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={
                activeTab === tab.key
                  ? `${styles.tab} ${styles.active}`
                  : styles.tab
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.loading}>Loading...</p>}

        {!loading && (
          <>
            <div className={styles["cat-table-wrapper"]}>
              <table className={styles["cat-table"]}>
                <thead>
                  <tr>
                    <th>Color</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Usage</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const normalizedColor = normalizeColor(category.color);
                    const shared = colorUsage.get(normalizedColor) || [];
                    const isShared = shared.length > 1;

                    return (
                      <tr key={category.id}>
                        <td>
                          <div className={styles["color-cell"]}>
                            <span
                              className={styles.swatch}
                              style={{ background: normalizedColor }}
                            />
                            <input
                              aria-label={`Color for ${category.title}`}
                              type="color"
                              value={normalizedColor}
                              disabled={busyId === category.id}
                              onChange={(event) =>
                                updateColor(category, event.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td>{category.title}</td>
                        <td>{category.description || "-"}</td>
                        <td>
                          {isShared ? (
                            <span
                              className={styles["shared-badge"]}
                              title={shared.map((item) => item.title).join(", ")}
                            >
                              Shared x{shared.length}
                            </span>
                          ) : (
                            <span className={styles["unique-badge"]}>Unique</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={styles["del-btn"]}
                            disabled={busyId === category.id}
                            onClick={() => del(category.id)}
                          >
                            {busyId === category.id ? "..." : "x"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles["cat-add-form"]}>
              <div className={styles["new-color"]}>
                <span className={styles.swatch} style={{ background: color }} />
                <input
                  aria-label="New category color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value.toUpperCase())}
                />
              </div>
              <input
                placeholder="Name"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <input
                placeholder="Description"
                value={descr}
                onChange={(event) => setDescr(event.target.value)}
              />
              <button className={styles["submit-button"]} onClick={addCategory}>
                Add
              </button>
            </div>
          </>
        )}

        <button className={styles["close-button"]} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ManageCategories;
