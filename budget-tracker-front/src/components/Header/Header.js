import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

import notificationsIcon from "../../data/notifications.svg";
import ExpenseModal from "../Modals/ExpenseModal/ExpenseModal";
import IncomeModal from "../Modals/IncomeModal/IncomeModal";
import TransferModal from "../Modals/TransferModal/TransferModal";
import API_ENDPOINTS from "../../config/apiConfig";
import { pageTitles } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";
import {
  DASHBOARD_CARD_OPTIONS,
  MAX_VISIBLE_DASHBOARD_CARDS,
  readVisibleDashboardCards,
  writeVisibleDashboardCards,
} from "../../pages/Dashboard/dashboardCardConfig";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPageTitle = pageTitles[location.pathname] || "My App";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [visibleDashboardCards, setVisibleDashboardCards] = useState(
    readVisibleDashboardCards,
  );

  const isDashboardPage =
    location.pathname === "/" || location.pathname === "/dashboard";

  useEffect(() => {
    if (location.pathname !== "/budget-plans") return;

    (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.monthPlans);
        if (!response.ok) throw new Error("Failed to load plans");
        setPlans(await response.json());
      } catch (error) {
        setPlansError(error.message);
      }
    })();

    const params = new URLSearchParams(location.search);
    setSelectedPlanId(params.get("planId") || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname !== "/events") return;

    (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.eventPlans);
        if (!response.ok) throw new Error("Failed to load events");
        setEvents(await response.json());
      } catch (error) {
        setEventsError(error.message);
      }
    })();

    const params = new URLSearchParams(location.search);
    setSelectedEventId(params.get("eventId") || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlanChange = (event) => {
    setSelectedPlanId(event.target.value);
    navigate(`/budget-plans?planId=${event.target.value}`);
  };

  const handleEventChange = (event) => {
    setSelectedEventId(event.target.value);
    navigate(`/events?eventId=${event.target.value}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDashboardCard = (cardId) => {
    setVisibleDashboardCards((current) => {
      const next = current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId];

      if (next.length > MAX_VISIBLE_DASHBOARD_CARDS) {
        return current;
      }

      return writeVisibleDashboardCards(next);
    });
  };

  const selectorMarkup =
    location.pathname === "/budget-plans" ? (
      <div className={styles["page-selector-slot"]}>
        {plansError && <p className={styles.error}>{plansError}</p>}
        <div className={styles["plans-dropdown"]}>
          <label htmlFor="planSelect">План</label>
          <div className={styles["custom-select-wrapper"]}>
            <select
              id="planSelect"
              value={selectedPlanId}
              onChange={handlePlanChange}
              className={styles["custom-select"]}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
            <span className={styles["custom-arrow"]} />
          </div>
        </div>
      </div>
    ) : location.pathname === "/events" ? (
      <div className={styles["page-selector-slot"]}>
        {eventsError && <p className={styles.error}>{eventsError}</p>}
        <div className={styles["plans-dropdown"]}>
          <label htmlFor="eventSelect">Событие</label>
          <div className={styles["custom-select-wrapper"]}>
            <select
              id="eventSelect"
              value={selectedEventId}
              onChange={handleEventChange}
              className={styles["custom-select"]}
            >
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <span className={styles["custom-arrow"]} />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <header className={styles.header}>
      <div className={styles["header-left"]}>
        <h2 className={styles["brand-title"]}>My App</h2>
      </div>

      <h2 className={styles["page-title"]}>{currentPageTitle}</h2>
      {selectorMarkup}

      <div className={styles["header-right"]}>
        <div className={styles["header-right-buttons"]}>
          {isDashboardPage && (
            <details className={styles["dashboard-card-picker"]}>
              <summary>
                Cards {visibleDashboardCards.length}/{MAX_VISIBLE_DASHBOARD_CARDS}
              </summary>
              <div className={styles["dashboard-card-picker-menu"]}>
                {DASHBOARD_CARD_OPTIONS.map((card) => {
                  const checked = visibleDashboardCards.includes(card.id);
                  const disabled =
                    !checked &&
                    visibleDashboardCards.length >= MAX_VISIBLE_DASHBOARD_CARDS;

                  return (
                    <label
                      key={card.id}
                      className={styles["dashboard-card-picker-item"]}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleDashboardCard(card.id)}
                      />
                      <span>{card.label}</span>
                    </label>
                  );
                })}
              </div>
            </details>
          )}
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
        <div className={styles["header-right-avatar"]} ref={avatarRef}>
          <button
            className={styles["avatar-button"]}
            onClick={() => setIsUserMenuOpen((open) => !open)}
          >
            <img src="favicon.ico" alt="User Avatar" className={styles.avatar} />
          </button>
          {isUserMenuOpen && (
            <div className={styles["user-menu"]}>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

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
