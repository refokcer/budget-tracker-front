import { Link, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import starIcon from "../../data/Star.svg";
import { menuLinks } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
        <button onClick={handleLogout} className={styles["sidebar-item"]}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
