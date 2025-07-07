import { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';
import TransferModal from '../../../components/Modals/TransferModal/TransferModal';

const TransfersTable = ({ month, year }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [busyId, setBusy] = useState(null);
  const [editTx, setEditTx] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoad(true); setErr(null);
      try {
        const url = API_ENDPOINTS.transfersTable(month, year);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Помилка завантаження');
        const data = await res.json();
        setRows(data.transactions);
      } catch (e) { setErr(e.message); }
      finally { setLoad(false); }
    };
    load();
  }, [month, year]);

  const del = async (id) => {
    if (!window.confirm('Видалити?')) return;
    try {
      setBusy(id);
      const r = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!r.ok) throw new Error('Помилка видалення');
      setRows(p => p.filter(x => x.id !== id));
    } catch (e) { alert(e.message); }
    finally { setBusy(null); }
  };

  const handleEdit = (tx) => setEditTx(tx);

  const handleSaved = (tx) => {
    setRows(p => p.map(x => (x.id === tx.id ? { ...x, ...tx } : x)));
    setEditTx(null);
  };

  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title',            label: 'Назва',       sortable: true },
    { key: 'amount',           label: 'Сума',        sortable: true, render: (v,r) => `${r.currencySymbol} ${v.toFixed(2)}` },
    { key: 'accountFromTitle', label: 'З рахунку',   sortable: true },
    { key: 'accountToTitle',   label: 'На рахунок',  sortable: true },
    { key: 'date',             label: 'Дата',        sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'description',      label: 'Опис',                        render: v => v || '-' },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        onDelete={del}
        onEdit={handleEdit}
        deletingId={busyId}
      />
      {editTx && (
        <TransferModal
          isOpen={!!editTx}
          onClose={() => setEditTx(null)}
          transaction={editTx}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};

export default TransfersTable;

