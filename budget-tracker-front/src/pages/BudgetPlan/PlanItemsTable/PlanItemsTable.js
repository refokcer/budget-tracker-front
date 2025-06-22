import React from 'react';
import DataTable from '../../../components/DataTable/DataTable';

const PlanItemsTable = ({ items, categoryMap, currencyMap }) => {
  if (!items || items.length === 0) return <p>Нет позиций в этом плане.</p>;

  const renderAmount = (val, curId) =>
    val === '-' ? '-' : `${currencyMap[curId] || ''}${val}`;

  const columns = [
    { key: 'categoryId', label: 'Категория', render: v => categoryMap[v] || v },
    { key: 'amount',     label: 'Выделено',  render: (v,r) => renderAmount(v, r.currencyId) },
    { key: 'spent',      label: 'Потрачено', render: (v,r) => renderAmount(v, r.currencyId) },
    { key: 'remaining',  label: 'Осталось',  render: (v,r) => renderAmount(v, r.currencyId) },
    { key: 'description',label: 'Описание',  render: v => v || '—' },
  ];

  return <DataTable columns={columns} rows={items} />;
};

export default PlanItemsTable;
