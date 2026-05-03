import { useEffect, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./SettingsPage.module.css";

import ManageAccountsModal from "../ManageAccounts/ManageAccounts";
import ManageCategoriesModal from "../ManageCategories/ManageCategories";
import ImportStatementModal from "../../../components/Modals/ImportStatementModal/ImportStatementModal";

const Settings = () => {
  const [accOpen, setAccOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [stmtOpen, setStmtOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [defaultCurrencyId, setDefaultCurrencyId] = useState("");
  const [defaultAccountId, setDefaultAccountId] = useState("");
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [defaultsError, setDefaultsError] = useState(null);
  const [defaultsSaved, setDefaultsSaved] = useState(false);

  const readError = async (response, fallback) => {
    const text = await response.text().catch(() => "");
    if (!text) return fallback;

    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map((item) => item.message || item.reason || String(item)).join(", ");
      }
      return data.message || data.error || text;
    } catch {
      return text;
    }
  };

  useEffect(() => {
    let alive = true;

    const loadDefaults = async () => {
      setLoadingDefaults(true);
      setDefaultsError(null);

      try {
        const [currenciesRes, accountsRes, settingsRes] = await Promise.all([
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.userSettings),
        ]);

        if (!currenciesRes.ok || !accountsRes.ok || !settingsRes.ok) {
          throw new Error(
            await readError(settingsRes, "Failed to load default transaction settings")
          );
        }

        const [currenciesData, accountsData, settingsData] = await Promise.all([
          currenciesRes.json(),
          accountsRes.json(),
          settingsRes.json(),
        ]);

        if (!alive) return;

        setCurrencies(currenciesData || []);
        setAccounts(accountsData || []);
        setDefaultCurrencyId(
          settingsData.defaultCurrencyId ? String(settingsData.defaultCurrencyId) : ""
        );
        setDefaultAccountId(
          settingsData.defaultAccountId ? String(settingsData.defaultAccountId) : ""
        );
      } catch (e) {
        if (alive) setDefaultsError(e.message);
      } finally {
        if (alive) setLoadingDefaults(false);
      }
    };

    loadDefaults();

    return () => {
      alive = false;
    };
  }, []);

  const saveDefaults = async () => {
    setSavingDefaults(true);
    setDefaultsError(null);
    setDefaultsSaved(false);

    try {
      const res = await fetch(API_ENDPOINTS.userSettings, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCurrencyId: defaultCurrencyId ? Number(defaultCurrencyId) : null,
          defaultAccountId: defaultAccountId ? Number(defaultAccountId) : null,
        }),
      });

      if (!res.ok) {
        throw new Error(await readError(res, "Failed to save default transaction settings"));
      }

      const settings = await res.json();
      setDefaultCurrencyId(settings.defaultCurrencyId ? String(settings.defaultCurrencyId) : "");
      setDefaultAccountId(settings.defaultAccountId ? String(settings.defaultAccountId) : "");
      setDefaultsSaved(true);
    } catch (e) {
      setDefaultsError(e.message);
    } finally {
      setSavingDefaults(false);
    }
  };

  return (
    <div className={styles["settings-container"]}>
      <div className={styles["settings-grid"]}>
        <section className={styles["settings-card"]}>
          <h3>Transaction defaults</h3>

          {defaultsError && <p className={styles["settings-error"]}>{defaultsError}</p>}
          {defaultsSaved && <p className={styles["settings-success"]}>Saved</p>}

          <label className={styles["settings-field"]}>
            <span>Main currency</span>
            <select
              value={defaultCurrencyId}
              onChange={(e) => {
                setDefaultCurrencyId(e.target.value);
                setDefaultsSaved(false);
              }}
              disabled={loadingDefaults}
            >
              <option value="">No default</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.symbol} ({currency.name || currency.title || currency.code})
                </option>
              ))}
            </select>
          </label>

          <label className={styles["settings-field"]}>
            <span>Main account</span>
            <select
              value={defaultAccountId}
              onChange={(e) => {
                setDefaultAccountId(e.target.value);
                setDefaultsSaved(false);
              }}
              disabled={loadingDefaults}
            >
              <option value="">No default</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.title}
                </option>
              ))}
            </select>
          </label>

          <button
            className={styles["settings-btn"]}
            onClick={saveDefaults}
            disabled={loadingDefaults || savingDefaults}
          >
            {savingDefaults ? "Saving..." : "Save defaults"}
          </button>
        </section>

        <section className={styles["settings-card"]}>
          <h3>Manage</h3>

          <button
            className={styles["settings-btn"]}
            onClick={() => setAccOpen(true)}
          >
            Manage accounts
          </button>

          <button
            className={styles["settings-btn"]}
            onClick={() => setCatOpen(true)}
          >
            Manage categories
          </button>
        </section>

        <section className={styles["settings-card"]}>
          <h3>Import</h3>
          <button
            className={styles["settings-btn"]}
            onClick={() => setStmtOpen(true)}
          >
            Import statement
          </button>
        </section>
      </div>

      <ManageAccountsModal isOpen={accOpen} onClose={() => setAccOpen(false)} />

      <ManageCategoriesModal
        isOpen={catOpen}
        onClose={() => setCatOpen(false)}
      />
      <ImportStatementModal
        isOpen={stmtOpen}
        onClose={() => setStmtOpen(false)}
      />
    </div>
  );
};

export default Settings;
