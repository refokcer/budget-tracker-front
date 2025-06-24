// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import starIcon from "../../data/Star.svg"; // Подключаем иконку
import dasbordIcon from "../../data/dashboards.png"; // Подключаем иконку

const menuLinks = [
  { to: "/dashboard", label: "Dashboard", icon: dasbordIcon },
  { to: "/expenses", label: "Expenses", icon: starIcon },
  { to: "/incomes", label: "Incomes", icon: starIcon },
  { to: "/transfers", label: "Transfers", icon: starIcon },
  { to: "/budget-plans", label: "Budget Plans", icon: starIcon },
  { to: "/report", label: "Monthly Report", icon: starIcon },
];

const Sidebar = () => (
  <div className={styles.sidebar}>
    <nav className={styles["sidebar-menu"]}>
      {menuLinks.map(({ to, label, icon }) => (
        <Link key={to} to={to} className={styles["sidebar-item"]}>
          <img src={icon} alt="icon" className={styles["sidebar-icon"]} />
          {label}
        </Link>
      ))}
    </nav>
    <div className={styles["sidebar-settings"]}>
      <Link to="/settings" className={styles["sidebar-item"]}>
        <img src={starIcon} alt="icon" className={styles["sidebar-icon"]} />
        Settings
      </Link>
    </div>
  </div>
);

export default Sidebar;
