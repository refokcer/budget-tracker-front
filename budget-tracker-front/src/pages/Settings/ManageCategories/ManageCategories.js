import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './ManageCategories.css';

/* вкладки: key, надпись, type, endpoint */
const tabs = [
  { key: 'expense',  label: 'Категории для трат',    type: 2, endpoint: API_ENDPOINTS.categoriesExpenses },
  { key: 'income',   label: 'Категории для доходов', type: 1, endpoint: API_ENDPOINTS.categoriesIncomes },
  { key: 'transfer', label: 'Категории транзакций',  type: 0, endpoint: API_ENDPOINTS.categoriesTransfers },
];

const ManageCategories = ({ isOpen, onClose }) => {
  const [activeTab,  setActiveTab]  = useState('expense');
  const [categories, setCategories] = useState([]);
  const [title,      setTitle]      = useState('');
  const [descr,      setDescr]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [busyId,     setBusyId]     = useState(null);

  /* загрузка при открытии или смене вкладки */
  useEffect(() => {
    if (!isOpen) return;

    const { endpoint } = tabs.find(t => t.key === activeTab);

    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Ошибка загрузки');
        setCategories(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, activeTab]);

  /* добавление новой категории */
  const addCategory = async () => {
    if (!title) return alert('Введите название');
    const { type } = tabs.find(t => t.key === activeTab);

    try {
      setLoading(true); setError(null);

      const res = await fetch(API_ENDPOINTS.createCategory, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, description: descr })
      });
      if (!res.ok) throw new Error('Ошибка создания');

      const newCat = await res.json();          /* получаем объект */
      setCategories(c => [...c, newCat]);       /* добавляем его */

      setTitle(''); setDescr('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* удаление */
  const del = async (id) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteCategory(id), { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка удаления');
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
        <h3>Manage categories</h3>

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
        {loading && <p>Загрузка...</p>}

        {!loading && (
          <>
            <div className="cat-table-wrapper">
              <table className="cat-table">
                <thead><tr><th>Название</th><th>Описание</th><th></th></tr></thead>
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
                placeholder="Название"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                placeholder="Описание"
                value={descr}
                onChange={e => setDescr(e.target.value)}
              />
              <button className="submit-button" onClick={addCategory}>
                Добавить
              </button>
            </div>
          </>
        )}

        <button className="close-button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default ManageCategories;
