// filepath: d:\Programming\Projects\budget-tracker\budget-tracker-front\budget-tracker-front\src\components\Modals\TransferModal\TransferModal.js
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './TransferModal.css';

const TransferModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currencyId, setCurrencyId] = useState('');
    const [accountFrom, setAccountFrom] = useState('');
    const [accountTo, setAccountTo] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const fetchData = async () => {
            try {
                const [currenciesRes, accountsRes, categoriesRes] = await Promise.all([
                    fetch(API_ENDPOINTS.currencies),
                    fetch(API_ENDPOINTS.accounts),
                    fetch(API_ENDPOINTS.categoriesTransfers),
                ]);

                if (!currenciesRes.ok || !accountsRes.ok || !categoriesRes.ok) {
                    throw new Error('Ошибка загрузки данных');
                }

                const accountsData = await accountsRes.json();
                const categoriesData = await categoriesRes.json();
                const currenciesData = await currenciesRes.json();

                setCategories(categoriesData);
                setCurrencies(currenciesData);
                setAccounts(accountsData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!title || !amount || !currencyId || !accountFrom || !accountTo) {
            alert('Заполните все поля!');
            return;
        }

        if (accountFrom === accountTo) {
            alert('Счёт отправителя и получателя не могут совпадать!');
            return;
        }

        setLoading(true);
        setError(null);
        const newTransfer = {
            title,
            amount: parseFloat(amount),
            accountFrom: parseInt(accountFrom),
            accountTo: parseInt(accountTo),
            eventId: 2,
            currencyId: parseInt(currencyId),
            categoryId: parseInt(categoryId),
            date: new Date().toISOString(),
            description
        };

        if (!newTransfer.categoryId) {
            alert('Выберите категорию!');
            return;
        }

        try {
            console.log(JSON.stringify(newTransfer, null, 2));

            const response = await fetch(API_ENDPOINTS.createTransfer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransfer),
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании перевода');
            }

            alert('Перевод успешно выполнен!');
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Создать перевод</h3>
                {error && <p className="error">{error}</p>}

                <input
                type="text"
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Сумма"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
                    <option value="">Выберите валюту</option>
                    {currencies.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.symbol} ({c.name})
                        </option>
                    ))}
                </select>

                <select value={accountFrom} onChange={(e) => setAccountFrom(e.target.value)}>
                    <option value="">Выберите счёт отправителя</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.title}
                        </option>
                    ))}
                </select>

                <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
                    <option value="">Выберите счёт получателя</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.title}
                        </option>
                    ))}
                </select>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.title}
                        </option>
                    ))}
                </select>

                <textarea
                    placeholder="Описание"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="submit-button"
                >
                    {loading ? 'Создание...' : 'Создать перевод'}
                </button>
                <button onClick={onClose} className="close-button">
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default TransferModal;