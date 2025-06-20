import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './ManageCategories.css';

/* вкладки: key, надпис, type, endpoint */
const tabs = [
  { key: 'expense',  label: 'Категорії для витрат',    type: 2, endpoint: API_ENDPOINTS.categoriesExpenses },
  { key: 'income',   label: 'Категорії для доходів',   type: 1, endpoint: API_ENDPOINTS.categoriesIncomes },
  { key: 'transfer', label: 'Категорії транзакцій',    type: 0, endpoint: API_ENDPOINTS.categoriesTransfers },
];

const ManageCategories = ({ isOpen, onClose }) => {
  const [activeTab,  setActiveTab]  = useState('expense');
  const [categories, setCategories] = useState([]);
  const [title,      setTitle]      = useState('');
  const [descr,      setDescr]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [busyId,     setBusyId]     = useState(null);

  /* завантаження при відкритті або зміні вкладки */
  useEffect(() => {
    if (!isOpen) return;

    const { endpoint } = tabs.find(t => t.key === activeTab);

    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Помилка завантаження');
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
    if (!title) return alert('Введіть назву');
    const { type } = tabs.find(t => t.key === activeTab);

    try {
      setLoading(true); setError(null);

      const res = await fetch(API_ENDPOINTS.createCategory, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, description: descr })
      });
      if (!res.ok) throw new Error('Помилка створення');

      const newCat = await res.json();          /* отримуємо об'єкт */
      setCategories(c => [...c, newCat]);       /* додаємо його */

      setTitle(''); setDescr('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* видалення */
  const del = async (id) => {
    if (!window.confirm('Видалити категорію?')) return;
    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteCategory(id), { method: 'DELETE' });
      if (!res.ok) throw new Error('Помилка видалення');
      setCategories(c => c.filter(x => x.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h3>Керування категоріями</h3>

        <div className="cat-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={activeTab === t.key ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Завантаження...</p>}

        {!loading && (
          <>
            <div className="cat-table-wrapper">
              <table className="cat-table">
                <thead><tr><th>Назва</th><th>Опис</th><th></th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.description || '-'}</td>
                      <td>
                        <button className="del-btn" disabled={busyId === c.id} onClick={() => del(c.id)}>
                          {busyId === c.id ? '…' : '✕'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cat-add-form">
              <input
                placeholder="Назва"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                placeholder="Опис"
                value={descr}
                onChange={e => setDescr(e.target.value)}
              />
              <button className="submit-button" onClick={addCategory}>
                Додати
              </button>
            </div>
          </>
        )}

        <button className="close-button" onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
};

export default ManageCategories;
