import { useState } from "react";
import styles from "./SettingsPage.module.css";

import ManageAccountsModal from "../ManageAccounts/ManageAccounts";
import ManageCategoriesModal from "../ManageCategories/ManageCategories";

const Settings = () => {
  const [accOpen, setAccOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

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
          <button className={styles["settings-btn"]}>Import statement</button>
        </section>
      </div>

      <ManageAccountsModal isOpen={accOpen} onClose={() => setAccOpen(false)} />

      <ManageCategoriesModal
        isOpen={catOpen}
        onClose={() => setCatOpen(false)}
      />
    </div>
  );
};

export default Settings;
