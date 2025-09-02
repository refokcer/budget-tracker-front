import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import starIcon from "../../data/Star.svg";
import { menuLinks } from "../../config/constants";

const Sidebar = () => {

  return (
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
};

export default Sidebar;
