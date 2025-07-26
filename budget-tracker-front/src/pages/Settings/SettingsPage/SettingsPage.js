import { useState } from "react";
import styles from "./SettingsPage.module.css";

import ManageAccountsModal from "../ManageAccounts/ManageAccounts";
import ManageCategoriesModal from "../ManageCategories/ManageCategories";
import ImportStatementModal from "../../../components/Modals/ImportStatementModal/ImportStatementModal";

const Settings = () => {
  const [accOpen, setAccOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [stmtOpen, setStmtOpen] = useState(false);

  return (
    <div className={styles["settings-container"]}>
      <div className={styles["settings-grid"]}>
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
