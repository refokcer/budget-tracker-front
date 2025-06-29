import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

import notificationsIcon from "../../data/notifications.svg";
import ExpenseModal from "../Modals/ExpenseModal/ExpenseModal";
import IncomeModal from "../Modals/IncomeModal/IncomeModal";
import TransferModal from "../Modals/TransferModal/TransferModal";
import API_ENDPOINTS from "../../config/apiConfig";
import { pageTitles } from "../../constants";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPageTitle = pageTitles[location.pathname] || "My App";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  /* — планы — */
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    if (location.pathname !== "/budget-plans") return;
    (async () => {
      try {
        const r = await fetch(API_ENDPOINTS.budgetPlans);
        if (!r.ok) throw new Error("Ошибка при загрузке планов");
        setPlans(await r.json());
      } catch (e) {
        setPlansError(e.message);
      }
    })();
  }, [location.pathname]);

  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    navigate(`/budget-plans?planId=${e.target.value}`);
  };

  return (
    <header className={styles.header}>
      {/* бренд слева */}
      <div className={styles["header-left"]}>
        <h2 className={styles["brand-title"]}>My App</h2>
      </div>

      {/* ЗАГОЛОВОК ЧЁТКО ПО ЦЕНТРУ ЭКРАНА */}
      <h2 className={styles["page-title"]}>{currentPageTitle}</h2>

      {/* выпадающий список планов только на /budget-plans */}
      {location.pathname === "/budget-plans" && (
        <div className={styles["plans-dropdown"]}>
          {plansError && <p className={styles.error}>{plansError}</p>}
          <label htmlFor="planSelect">План:</label>
          <div className={styles["custom-select-wrapper"]}>
            <select
              id="planSelect"
              value={selectedPlanId}
              onChange={handlePlanChange}
              className={styles["custom-select"]}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <span className={styles["custom-arrow"]} />
          </div>
        </div>
      )}

      {/* правая часть */}
      <div className={styles["header-right"]}>
        <div className={styles["header-right-buttons"]}>
          <button
            className={styles.expense}
            onClick={() => setIsModalOpen(true)}
          >
            + expense
          </button>
          <button
            className={styles.income}
            onClick={() => setIsIncomeModalOpen(true)}
          >
            + income
          </button>
          <button
            className={styles.transfer}
            onClick={() => setIsTransferModalOpen(true)}
          >
            + transfer
          </button>
        </div>
        <div className={styles["header-right-icons"]}>
          <img
            src={notificationsIcon}
            alt="Notifications"
            className={styles["bell-icon"]}
          />
        </div>
        <div className={styles["header-right-avatar"]}>
          <img src="favicon.ico" alt="User Avatar" className={styles.avatar} />
        </div>
      </div>

      {/* модалки */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </header>
  );
};

export default Header;
