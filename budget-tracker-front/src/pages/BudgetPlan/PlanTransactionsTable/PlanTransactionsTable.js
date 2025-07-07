import { useState, useEffect } from 'react';
import DataTable from '../../../components/DataTable/DataTable';
import ExpenseModal from '../../../components/Modals/ExpenseModal/ExpenseModal';
import IncomeModal from '../../../components/Modals/IncomeModal/IncomeModal';
import TransferModal from '../../../components/Modals/TransferModal/TransferModal';
import API_ENDPOINTS from '../../../config/apiConfig';

const PlanTransactionsTable = ({ planId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [editTx, setEditTx] = useState(null);

  useEffect(() => {
    if (!planId) return;
    const controller = new AbortController();
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.transactionsByPlan(planId), { signal: controller.signal });
        if (!res.ok) throw new Error('Помилка завантаження');
        const data = await res.json();
        setTransactions(data.transactions || data);
      } catch (e) { if (e.name !== 'AbortError') setError(e.message); }
      finally { setLoading(false); }
    })();
    return () => controller.abort();
  }, [planId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити транзакцію?')) return;
    try {
      setBusyId(id);
      const r = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!r.ok) throw new Error('Помилка видалення');
      setTransactions(t => t.filter(tx => tx.id !== id));
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  const handleEdit = (tx) => setEditTx(tx);

  const handleSaved = (tx) => {
    setTransactions(t => t.map(x => (x.id === tx.id ? { ...x, ...tx } : x)));
    setEditTx(null);
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title', label: 'Назва', sortable: true },
    {
      key: 'amount',
      label: 'Сума',
      sortable: true,
      render: (v, r) => `${r.currencySymbol} ${Number(v).toFixed(2)}`,
    },
    {
      key: 'categoryTitle',
      label: 'Категорія',
      sortable: true,
      render: (v) => v || '-',
    },
    {
      key: 'accountTitle',
      label: 'Рахунок',
      sortable: true,
      render: (v, r) => v || r.accountFromTitle || r.accountToTitle || '-',
    },
    {
      key: 'accountFromTitle',
      label: 'З рахунку',
      sortable: true,
      render: (v) => v || '-',
    },
    {
      key: 'accountToTitle',
      label: 'На рахунок',
      sortable: true,
      render: (v) => v || '-',
    },
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      render: (v) => new Date(v).toLocaleDateString(),
    },
    { key: 'description', label: 'Опис', render: (v) => v || '-' },
  ];

  const renderModal = () => {
    if (!editTx) return null;
    // determine type based on available account fields
    if (editTx.accountFromTitle && editTx.accountToTitle) {
      return (
        <TransferModal
          isOpen={true}
          onClose={() => setEditTx(null)}
          transaction={editTx}
          onSaved={handleSaved}
        />
      );
    }
    if (editTx.accountFromTitle) {
      return (
        <ExpenseModal
          isOpen={true}
          onClose={() => setEditTx(null)}
          transaction={editTx}
          onSaved={handleSaved}
        />
      );
    }
    return (
      <IncomeModal
        isOpen={true}
        onClose={() => setEditTx(null)}
        transaction={editTx}
        onSaved={handleSaved}
      />
    );
  };

  return (
    <>
      <DataTable
        columns={columns}
        rows={transactions}
        onDelete={handleDelete}
        onEdit={handleEdit}
        deletingId={busyId}
      />
      {renderModal()}
    </>
  );
};

export default PlanTransactionsTable;
