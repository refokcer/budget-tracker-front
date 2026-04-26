import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import starIcon from "../../data/Star.svg";
import { menuLinks } from "../../config/constants";

const Sidebar = () => {

  return (
    <div className={styles.sidebar}>
      <nav className={styles["sidebar-menu"]}>
        {menuLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles["sidebar-item"]} ${isActive ? styles["sidebar-item-active"] : ""}`
            }
          >
            <img src={icon} alt="icon" className={styles["sidebar-icon"]} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={styles["sidebar-settings"]}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles["sidebar-item"]} ${isActive ? styles["sidebar-item-active"] : ""}`
          }
        >
          <img src={starIcon} alt="icon" className={styles["sidebar-icon"]} />
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
