import React, { useState, useRef } from 'react';
import Papa from 'papaparse';                  // npm i papaparse
import API_ENDPOINTS from '../../../config/apiConfig';
import styles from './ManageImportModal.module.css';

/**
 * Перетворює рядок ПриватБанк-csv → об’єкт TransactionDTO.
 * Файл може бути в UTF-8/Win1251. Зчитуємо через FileReader.
 *
 * Очікувані колонки (UA web-виписка):
 * 0 - Дата та час
 * 1 - Тип операції
 * 2 - Номер картки
 * 3 - Опис (поле "Назва")
 * 4 - Сума (знак + / -)
 * 5 - Валюта
 *
 * Mapping:
 *   + сума  -> Income  (type = 1)
 *   – сума  -> Expense (type = 2)
 * categoryId  → null   (або підбираєте за описом, якщо треба)
 * currencyId   = 1     (UAH) – знайдіть власну відповідність, якщо потрібно
 * accountFrom / accountTo  = null (або виберіть зі списку, якщо треба)
 */
const mapRow = (row) => {
  const [dateTime, , , title, amountRaw, currency] = row;
  if (!title || !amountRaw) return null;

  const amount = parseFloat(amountRaw.replace(/\s/g, '').replace(',', '.'));
  const isIncome = amount > 0;

  return {
    title:        title.trim().slice(0, 100),
    amount:       Math.abs(amount),
    currencyId:   1,                   // TODO: зіставити (UAH = 1)
    categoryId:   null,
    date:         new Date(dateTime).toISOString(),
    accountFrom:  isIncome ? null : null,   // можна заповнити за потреби
    accountTo:    isIncome ? null : null,
    type:         isIncome ? 1 : 2,
    description:  row[3]?.trim() || '',
    budgetPlanId: null,
  };
};

const ManageImportModal = ({ isOpen, onClose }) => {
  const fileRef           = useRef(null);
  const [rowsOk, setRows] = useState([]);
  const [rowsErr, setErr] = useState([]);
  const [step, setStep]   = useState('select'); // select | preview | sending
  const [error, setError] = useState(null);

  /* ───────── читання файлу ───────── */
  const handleFile = () => {
    const file = fileRef.current.files[0];
    if (!file) return;

    Papa.parse(file, {
      delimiter: ';',
      skipEmptyLines: true,
      complete: (res) => {
        // перший рядок web-csv Привату – «Звіт…», пропускаємо
        const raw = res.data.filter(r => /^\d{2}\./.test(r[0]));
        const good = [], bad = [];

        raw.forEach((r, idx) => {
          try {
            const obj = mapRow(r);
            if (obj) good.push(obj);
          } catch {
            bad.push(idx + 2); // +2 — бо пропустили заголовок і нумерація з 1
          }
        });

        setRows(good);
        setErr(bad);
        setStep('preview');
      },
      error: (err) => setError(err.message),
    });
  };

  /* ───────── надсилання у бекенд ───────── */
  const sendData = async () => {
    setStep('sending');
    try {
      await Promise.all(
        rowsOk.map((trx) =>
          fetch(API_ENDPOINTS.createTransaction, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trx),
          }),
        ),
      );
      onClose();
      alert(`Імпортовано ${rowsOk.length} транзакцій`);
    } catch (e) {
      setError('Помилка під час імпорту. Спробуйте пізніше.');
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['imp-overlay']}>
      <div className={styles['imp-modal']}>
        <h3 className={styles['imp-title']}>Імпорт виписки</h3>

        {step === 'select' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className={styles['imp-file']}
            />
            {error && <p className={styles['imp-error']}>{error}</p>}
          </>
        )}

        {step === 'preview' && (
          <>
            <p className={styles['imp-info']}>
              Рядків до імпорту: <strong>{rowsOk.length}</strong>
              {rowsErr.length > 0 && (
                <>,&nbsp;пропущено: {rowsErr.length}</>
              )}
            </p>
            {rowsErr.length > 0 && (
              <details>
                <summary>Показати номера пропущених рядків</summary>
                <div className={styles['imp-error']}>{rowsErr.join(', ')}</div>
              </details>
            )}
            <button className={`${styles['imp-btn']} ${styles['imp-green']}`} onClick={sendData}>
              Імпортувати
            </button>
          </>
        )}

        {step === 'sending' && <p className={styles['imp-info']}>Імпорт …</p>}

        <button className={`${styles['imp-btn']} ${styles['imp-red']}`} onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default ManageImportModal;
