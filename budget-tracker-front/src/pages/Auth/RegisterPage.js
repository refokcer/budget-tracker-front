import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./AuthPage.module.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className={styles["auth-container"]}>
      <div className={styles["auth-card"]}> 
        <h2 className={styles["auth-title"]}>Register</h2>
        <form onSubmit={handleSubmit} className={styles["auth-form"]}>
          <input
            className={styles["auth-input"]}
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles["auth-input"]}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className={styles["auth-button"]}>
            Register
          </button>
        </form>
        {error && <p className={styles["auth-error"]}>{error}</p>}
        <p className={styles["auth-link"]}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
