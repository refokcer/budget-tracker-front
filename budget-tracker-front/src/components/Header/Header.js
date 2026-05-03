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
import { sortMonthlyPlans } from "../../utils/budgetPlans";
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
  const dashboardCardsRef = useRef(null);

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
        setPlans(sortMonthlyPlans(await response.json()));
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

      if (
        dashboardCardsRef.current &&
        !dashboardCardsRef.current.contains(event.target)
      ) {
        dashboardCardsRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const selectedPlan = plans.find((plan) => String(plan.id) === String(selectedPlanId));
  const selectedEvent = events.find((event) => String(event.id) === String(selectedEventId));

  const selectorMarkup =
    location.pathname === "/budget-plans" ? (
      <div className={styles["page-selector-slot"]}>
        {plansError && <p className={styles.error}>{plansError}</p>}
        <div className={styles["plans-dropdown"]}>
          <label htmlFor="planSelect">План</label>
          <details className={styles["header-select"]} id="planSelect">
            <summary className={styles["header-select-trigger"]}>
              <span>{selectedPlan?.title || "Выбрать план"}</span>
              <span className={styles["header-select-icon"]}>▾</span>
            </summary>
            <div className={styles["header-select-menu"]}>
              {plans.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  className={`${styles["header-select-option"]} ${
                    String(plan.id) === String(selectedPlanId)
                      ? styles["header-select-option-active"]
                      : ""
                  }`}
                  onClick={(event) => {
                    setSelectedPlanId(String(plan.id));
                    navigate(`/budget-plans?planId=${plan.id}`);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {plan.title}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    ) : location.pathname === "/events" ? (
      <div className={styles["page-selector-slot"]}>
        {eventsError && <p className={styles.error}>{eventsError}</p>}
        <div className={styles["plans-dropdown"]}>
          <label htmlFor="eventSelect">Событие</label>
          <details className={styles["header-select"]} id="eventSelect">
            <summary className={styles["header-select-trigger"]}>
              <span>{selectedEvent?.title || "Выбрать событие"}</span>
              <span className={styles["header-select-icon"]}>▾</span>
            </summary>
            <div className={styles["header-select-menu"]}>
              {events.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`${styles["header-select-option"]} ${
                    String(item.id) === String(selectedEventId)
                      ? styles["header-select-option-active"]
                      : ""
                  }`}
                  onClick={(event) => {
                    setSelectedEventId(String(item.id));
                    navigate(`/events?eventId=${item.id}`);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    ) : null;

  return (
    <header className={styles.header}>
      <div className={styles["header-left"]}>
        <h2 className={styles["brand-title"]}>My App</h2>
      </div>

      <div className={styles["header-center"]}>
        <h2 className={styles["page-title"]}>{currentPageTitle}</h2>
        {selectorMarkup}
      </div>

      <div className={styles["header-right"]}>
        <div className={styles["header-right-buttons"]}>
          {isDashboardPage && (
            <details
              className={styles["dashboard-card-picker"]}
              ref={dashboardCardsRef}
            >
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
