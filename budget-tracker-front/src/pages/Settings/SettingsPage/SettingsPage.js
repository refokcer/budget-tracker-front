import React, { useState } from 'react';
import './SettingsPage.css';

import ManageAccountsModal   from '../ManageAccounts/ManageAccounts';
import ManageCategoriesModal from '../ManageCategories/ManageCategories';

const Settings = () => {
  const [accOpen, setAccOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  return (
    <div className="settings-container">
      <div className="settings-grid">

        {/* ───── Manage ───── */}
        <section className="settings-card">
          <h3>Manage</h3>

          <button className="settings-btn" onClick={()=>setAccOpen(true)}>
            Manage accounts
          </button>

          <button className="settings-btn" onClick={()=>setCatOpen(true)}>
            Manage categories
          </button>
        </section>

        {/* ───── Import ───── */}
        <section className="settings-card">
          <h3>Import</h3>
          <button className="settings-btn">Import statement</button>
        </section>
      </div>

      {/* модалки */}
      <ManageAccountsModal
        isOpen={accOpen}
        onClose={()=>setAccOpen(false)}
      />

      <ManageCategoriesModal
        isOpen={catOpen}
        onClose={()=>setCatOpen(false)}
      />
    </div>
  );
};

export default Settings;
