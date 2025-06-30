import DataTable from '../../../components/DataTable/DataTable';

const PlanItemsTable = ({ items }) => {
  if (!items || items.length === 0) return <p>Нет позиций в этом плане.</p>;
  const renderAmount = (val, symbol) =>
    val === '-' ? '-' : `${symbol}${val}`;

  const columns = [
    { key: 'categoryTitle', label: 'Категория' },
    { key: 'amount',     label: 'Выделено',  render: (v,r) => renderAmount(v, r.currencySymbol) },
    { key: 'spent',      label: 'Потрачено', render: (v,r) => renderAmount(v, r.currencySymbol) },
    { key: 'remaining',  label: 'Осталось',  render: (v,r) => renderAmount(v, r.currencySymbol) },
    { key: 'description',label: 'Описание',  render: v => v || '—' },
  ];

  return <DataTable columns={columns} rows={items} />;
};

export default PlanItemsTable;
