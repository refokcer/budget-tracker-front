import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./AutoPlanRulesPage.module.css";

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const cutOptions = [
  { value: "Normal", label: "Normal" },
  { value: "Protected", label: "Do not cut" },
  { value: "Aggressive", label: "Cut aggressively" },
];

const isExpenseCategory = (category) => Number(category.type) === 2;

const createDefaultRule = (categoryId) => ({
  categoryId: Number(categoryId),
  minimumLimit: "",
  maximumLimit: "",
  cutBehavior: "Normal",
  monthCoefficients: months.map((month) => ({
    month: month.value,
    multiplier: "1",
  })),
});

const normalizeRule = (categoryId, incomingRule) => {
  const normalized = createDefaultRule(categoryId);
  if (!incomingRule) return normalized;

  const incomingMonths = Array.isArray(incomingRule.monthCoefficients)
    ? incomingRule.monthCoefficients
    : [];

  return {
    ...normalized,
    minimumLimit:
      incomingRule.minimumLimit === null || incomingRule.minimumLimit === undefined
        ? ""
        : String(incomingRule.minimumLimit),
    maximumLimit:
      incomingRule.maximumLimit === null || incomingRule.maximumLimit === undefined
        ? ""
        : String(incomingRule.maximumLimit),
    cutBehavior: cutOptions.some((option) => option.value === incomingRule.cutBehavior)
      ? incomingRule.cutBehavior
      : "Normal",
    monthCoefficients: months.map((month) => {
      const found = incomingMonths.find((item) => Number(item.month) === month.value);
      return {
        month: month.value,
        multiplier: String(found?.multiplier ?? 1),
      };
    }),
  };
};

const buildPayloadRule = (rule) => ({
  categoryId: Number(rule.categoryId),
  minimumLimit: rule.minimumLimit === "" ? null : Number(rule.minimumLimit),
  maximumLimit: rule.maximumLimit === "" ? null : Number(rule.maximumLimit),
  cutBehavior: rule.cutBehavior || "Normal",
  monthCoefficients: rule.monthCoefficients.map((item) => ({
    month: Number(item.month),
    multiplier: Number(item.multiplier || 1),
  })),
});

const AutoPlanRulesPage = () => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter(isExpenseCategory),
    [categories]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [categoriesData, settingsData] = await Promise.all([
          apiJson(API_ENDPOINTS.categories, {}, "Failed to load auto plan rules"),
          apiJson(API_ENDPOINTS.userSettings, {}, "Failed to load auto plan rules"),
        ]);

        if (!alive) return;

        const expenseItems = (Array.isArray(categoriesData) ? categoriesData : [])
          .filter(isExpenseCategory);
        const incomingRules = settingsData?.autoBudgetPlanRules?.categoryRules || [];

        setSettings(settingsData || {});
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRules(
          expenseItems.map((category) => {
            const found = incomingRules.find(
              (rule) => Number(rule.categoryId) === Number(category.id)
            );
            return normalizeRule(category.id, found);
          })
        );
      } catch (e) {
        if (alive) setError(getApiErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  const updateRule = (categoryId, updater) => {
    setSaved(false);
    setRules((current) =>
      current.map((rule) =>
        Number(rule.categoryId) === Number(categoryId)
          ? updater(rule)
          : rule
      )
    );
  };

  const updateMonth = (categoryId, month, value) => {
    updateRule(categoryId, (rule) => ({
      ...rule,
      monthCoefficients: rule.monthCoefficients.map((item) =>
        item.month === month ? { ...item, multiplier: value } : item
      ),
    }));
  };

  const saveRules = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await apiJson(API_ENDPOINTS.userSettings, {
        method: "PUT",
        body: {
          defaultCurrencyId: settings?.defaultCurrencyId ?? null,
          defaultAccountId: settings?.defaultAccountId ?? null,
          autoBudgetPlanRules: {
            categoryRules: rules.map(buildPayloadRule),
          },
        },
      }, "Failed to save auto plan rules");

      const incomingRules = updated?.autoBudgetPlanRules?.categoryRules || [];
      setSettings(updated || {});
      setRules(
        expenseCategories.map((category) => {
          const found = incomingRules.find(
            (rule) => Number(rule.categoryId) === Number(category.id)
          );
          return normalizeRule(category.id, found);
        })
      );
      setSaved(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Auto plan rules</h2>
          <p>Category rules used by automatic monthly budget generation.</p>
        </div>
        <Link className={styles.backLink} to="/settings">
          Back to settings
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {saved && <p className={styles.success}>Auto plan rules saved</p>}

      <section className={styles.panel}>
        <div className={styles.tableHeader}>
          <span>Category</span>
          <span>Cut behavior</span>
          <span>Minimum</span>
          <span>Maximum</span>
        </div>

        {loading && <p className={styles.muted}>Loading rules...</p>}

        {!loading && rules.length === 0 && (
          <p className={styles.muted}>No expense categories found.</p>
        )}

        {!loading && rules.map((rule) => {
          const category = expenseCategories.find(
            (item) => Number(item.id) === Number(rule.categoryId)
          );

          return (
            <div key={rule.categoryId} className={styles.ruleRow}>
              <div className={styles.categoryName}>{category?.title || `Category #${rule.categoryId}`}</div>

              <label className={styles.field}>
                <span>Cut behavior</span>
                <select
                  value={rule.cutBehavior}
                  onChange={(event) =>
                    updateRule(rule.categoryId, (current) => ({
                      ...current,
                      cutBehavior: event.target.value,
                    }))
                  }
                >
                  {cutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Minimum</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rule.minimumLimit}
                  onChange={(event) =>
                    updateRule(rule.categoryId, (current) => ({
                      ...current,
                      minimumLimit: event.target.value,
                    }))
                  }
                  placeholder="No minimum"
                />
              </label>

              <label className={styles.field}>
                <span>Maximum</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rule.maximumLimit}
                  onChange={(event) =>
                    updateRule(rule.categoryId, (current) => ({
                      ...current,
                      maximumLimit: event.target.value,
                    }))
                  }
                  placeholder="No maximum"
                />
              </label>

              <div className={styles.monthGrid}>
                {months.map((month) => {
                  const coefficient = rule.monthCoefficients.find(
                    (item) => item.month === month.value
                  );

                  return (
                    <label key={month.value} className={styles.monthField}>
                      <span>{month.label}</span>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.01"
                        value={coefficient?.multiplier ?? "1"}
                        onChange={(event) =>
                          updateMonth(rule.categoryId, month.value, event.target.value)
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <div className={styles.actions}>
        <button type="button" onClick={saveRules} disabled={loading || saving}>
          {saving ? "Saving..." : "Save auto plan rules"}
        </button>
      </div>
    </div>
  );
};

export default AutoPlanRulesPage;
