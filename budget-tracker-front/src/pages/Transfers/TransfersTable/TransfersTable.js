import { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';
import EditTransferModal from '../../../components/Modals/EditTransferModal/EditTransferModal';

const TransfersTable = ({ month, year }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [busyId, setBusy] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const reloadRef = useRef(() => {});

  useEffect(() => {
    const load = async () => {
      setLoad(true); setErr(null);
      try {
        const url = API_ENDPOINTS.transfersTable(month, year);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load data');
        const data = await res.json();
        setRows(data.transactions);
      } catch (e) { setErr(e.message); }
      finally { setLoad(false); }
    };
    load();
    reloadRef.current = load;
  }, [month, year]);

  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      setBusy(id);
      const r = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete error');
      setRows(p => p.filter(x => x.id !== id));
    } catch (e) { alert(e.message); }
    finally { setBusy(null); }
  };

  const handleEdit = async (id) => {
    try {
      const r = await fetch(API_ENDPOINTS.transactionById(id));
      if (!r.ok) throw new Error('Failed to load data');
      setEditTx(await r.json());
      setEditOpen(true);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p className="error">Error: {error}</p>;

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
        deletingId={busyId}
        onEdit={handleEdit}
      />
      <EditTransferModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        transaction={editTx}
        onSaved={() => reloadRef.current()}
      />
    </>
  );
};

export default TransfersTable;

