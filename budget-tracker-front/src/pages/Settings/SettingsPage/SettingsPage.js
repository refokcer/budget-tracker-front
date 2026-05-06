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
  const [adminJson, setAdminJson] = useState("");
  const [adminTemplates, setAdminTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);
  const [adminError, setAdminError] = useState(null);

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

    const loadSettingsData = async () => {
      setLoadingDefaults(true);
      setLoadingTemplates(true);
      setDefaultsError(null);

      try {
        const [currenciesRes, accountsRes, settingsRes, templatesRes] = await Promise.all([
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.userSettings),
          fetch(API_ENDPOINTS.adminDataTemplates),
        ]);

        const failedResponse = [currenciesRes, accountsRes, settingsRes, templatesRes].find(
          (response) => !response.ok
        );
        if (failedResponse) {
          throw new Error(await readError(failedResponse, "Failed to load settings data"));
        }

        const [currenciesData, accountsData, settingsData, templatesData] = await Promise.all([
          currenciesRes.json(),
          accountsRes.json(),
          settingsRes.json(),
          templatesRes.json(),
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
        setAdminTemplates(templatesData || []);
        setSelectedTemplateId(templatesData?.[0]?.id || "");
      } catch (e) {
        if (alive) setDefaultsError(e.message);
      } finally {
        if (alive) {
          setLoadingDefaults(false);
          setLoadingTemplates(false);
        }
      }
    };

    loadSettingsData();

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

  const loadSampleJson = async () => {
    setAdminBusy(true);
    setAdminError(null);
    setAdminMessage(null);

    try {
      const res = await fetch(API_ENDPOINTS.adminDataSample);
      if (!res.ok) throw new Error(await readError(res, "Failed to load sample JSON"));
      const sample = await res.json();
      setAdminJson(JSON.stringify(sample, null, 2));
      setAdminMessage("Sample JSON loaded");
    } catch (e) {
      setAdminError(e.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const loadTemplateJson = async () => {
    if (!selectedTemplateId) return;

    setAdminBusy(true);
    setAdminError(null);
    setAdminMessage(null);

    try {
      const res = await fetch(API_ENDPOINTS.adminDataTemplate(selectedTemplateId));
      if (!res.ok) throw new Error(await readError(res, "Failed to load template JSON"));
      const template = await res.json();
      const meta = adminTemplates.find((item) => item.id === selectedTemplateId);
      setAdminJson(JSON.stringify(template, null, 2));
      setAdminMessage(`${meta?.name || "Template"} JSON loaded`);
    } catch (e) {
      setAdminError(e.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const clearAdminData = async () => {
    const confirmation = window.prompt(
      "This will delete all your accounts, categories, plans, transactions, goals and settings. Type DELETE to confirm."
    );
    if (confirmation !== "DELETE") return;

    setAdminBusy(true);
    setAdminError(null);
    setAdminMessage(null);

    try {
      const res = await fetch(API_ENDPOINTS.adminDataClear, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to clear data"));
      setAdminMessage("Current user data cleared");
      setAccounts([]);
      setDefaultAccountId("");
      setDefaultCurrencyId("");
    } catch (e) {
      setAdminError(e.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const importAdminJson = async () => {
    setAdminBusy(true);
    setAdminError(null);
    setAdminMessage(null);

    try {
      const payload = JSON.parse(adminJson);
      const res = await fetch(API_ENDPOINTS.adminDataImport, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to import JSON"));
      const result = await res.json();
      setAdminMessage(
        `Imported: ${result.accounts} accounts, ${result.categories} categories, ${result.budgetPlans} plans, ${result.transactions} transactions, ${result.financialGoals} goals`
      );
    } catch (e) {
      setAdminError(e.message);
    } finally {
      setAdminBusy(false);
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

        <section className={`${styles["settings-card"]} ${styles["settings-card-wide"]}`}>
          <h3>Admin data</h3>
          <p className={styles["settings-muted"]}>
            Clear current user data or import a full simulation from one JSON file.
          </p>

          {adminError && <p className={styles["settings-error"]}>{adminError}</p>}
          {adminMessage && <p className={styles["settings-success"]}>{adminMessage}</p>}

          <div className={styles["template-panel"]}>
            <label className={styles["settings-field"]}>
              <span>Simulation template</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setAdminMessage(null);
                  setAdminError(null);
                }}
                disabled={loadingTemplates || adminBusy || adminTemplates.length === 0}
              >
                {adminTemplates.length === 0 && (
                  <option value="">No templates found</option>
                )}
                {adminTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles["template-summary"]}>
              {adminTemplates
                .filter((template) => template.id === selectedTemplateId)
                .map((template) => (
                  <div key={template.id}>
                    <p>{template.description}</p>
                    <span>
                      {template.accounts} accounts / {template.categories} categories /{" "}
                      {template.budgetPlans} plans / {template.transactions} transactions /{" "}
                      {template.financialGoals} goals
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <textarea
            className={styles["admin-json"]}
            value={adminJson}
            onChange={(e) => {
              setAdminJson(e.target.value);
              setAdminMessage(null);
              setAdminError(null);
            }}
            placeholder="Paste admin seed JSON here"
            spellCheck="false"
          />

          <div className={styles["admin-actions"]}>
            <button
              className={styles["settings-btn"]}
              onClick={loadTemplateJson}
              disabled={adminBusy || loadingTemplates || !selectedTemplateId}
            >
              Load selected template
            </button>
            <button
              className={styles["settings-btn"]}
              onClick={loadSampleJson}
              disabled={adminBusy}
            >
              Load sample JSON
            </button>
            <button
              className={styles["settings-btn"]}
              onClick={importAdminJson}
              disabled={adminBusy || !adminJson.trim()}
            >
              Import JSON
            </button>
            <button
              className={`${styles["settings-btn"]} ${styles["danger-btn"]}`}
              onClick={clearAdminData}
              disabled={adminBusy}
            >
              Clear all current data
            </button>
          </div>
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
