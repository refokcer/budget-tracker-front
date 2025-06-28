import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./ManageCategories.module.css";

/* вкладки: key, надпис, type */
const tabs = [
  {
    key: "expense",
    label: "Категорії для витрат",
    type: 2,
  },
  {
    key: "income",
    label: "Категорії для доходів",
    type: 1,
  },
  {
    key: "transfer",
    label: "Категорії транзакцій",
    type: 0,
  },
];

const ManageCategories = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [descr, setDescr] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  /* завантаження при відкритті або зміні вкладки */
  useEffect(() => {
    if (!isOpen) return;

    const { type } = tabs.find((t) => t.key === activeTab);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_ENDPOINTS.manageCategories(type));
        if (!res.ok) throw new Error("Помилка завантаження");
        setCategories(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, activeTab]);

  /* додавання нової категорії */
  const addCategory = async () => {
    if (!title) return alert("Введіть назву");
    const { type } = tabs.find((t) => t.key === activeTab);

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_ENDPOINTS.createCategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, description: descr }),
      });
      if (!res.ok) throw new Error("Помилка створення");

      const newCat = await res.json(); /* отримуємо об'єкт */
      setCategories((c) => [...c, newCat]); /* додаємо його */

      setTitle("");
      setDescr("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* видалення */
  const del = async (id) => {
    if (!window.confirm("Видалити категорію?")) return;
    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteCategory(id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Помилка видалення");
      setCategories((c) => c.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={`${styles["modal-content"]} ${styles.large}`}>
        <h3>Керування категоріями</h3>

        <div className={styles["cat-tabs"]}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={
                activeTab === t.key
                  ? `${styles.tab} ${styles.active}`
                  : styles.tab
              }
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p>Завантаження...</p>}

        {!loading && (
          <>
            <div className={styles["cat-table-wrapper"]}>
              <table className={styles["cat-table"]}>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.description || "-"}</td>
                      <td>
                        <button
                          className={styles["del-btn"]}
                          disabled={busyId === c.id}
                          onClick={() => del(c.id)}
                        >
                          {busyId === c.id ? "…" : "✕"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles["cat-add-form"]}>
              <input
                placeholder="Назва"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                placeholder="Опис"
                value={descr}
                onChange={(e) => setDescr(e.target.value)}
              />
              <button className={styles["submit-button"]} onClick={addCategory}>
                Додати
              </button>
            </div>
          </>
        )}

        <button className={styles["close-button"]} onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default ManageCategories;
// Expected model from API_ENDPOINTS.manageCategories(type): { categories }
