import { useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./ProfilePage.module.css";

const emptyProfile = {
  fullName: "",
  userName: "",
  email: "",
  phoneNumber: "",
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const initialsFromProfile = (profile) => {
  const source = profile?.fullName || profile?.email || profile?.userName || "User";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiJson(API_ENDPOINTS.userProfile, {}, "Failed to load profile");
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          userName: data.userName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statusItems = useMemo(() => {
    if (!profile) return [];
    return [
      {
        label: "Email",
        value: profile.emailConfirmed ? "Confirmed" : "Not confirmed",
        good: profile.emailConfirmed,
      },
      {
        label: "Phone",
        value: profile.phoneNumberConfirmed ? "Confirmed" : "Not confirmed",
        good: profile.phoneNumberConfirmed,
      },
      {
        label: "Two-factor",
        value: profile.twoFactorEnabled ? "Enabled" : "Disabled",
        good: profile.twoFactorEnabled,
      },
      {
        label: "Lockout",
        value: profile.lockoutEnabled ? "Enabled" : "Disabled",
        good: profile.lockoutEnabled,
      },
    ];
  }, [profile]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePasswordField = (key, value) => {
    setPasswordForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await apiJson(API_ENDPOINTS.userProfile, {
        method: "PUT",
        body: form,
      }, "Failed to save profile");
      setProfile(updated);
      setSuccess("Profile saved.");
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await apiFetch(API_ENDPOINTS.userProfilePassword, {
        method: "PUT",
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      }, "Failed to change password");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Password changed.");
    } catch (e) {
      setPasswordMessage(getApiErrorMessage(e));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading profile...</p>;
  if (error && !profile) return <p className={styles.error}>{error}</p>;
  if (!profile) return null;

  const stats = profile.stats || {};

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.avatar}>{initialsFromProfile(profile)}</div>
        <div className={styles.identity}>
          <span>Account profile</span>
          <h2>{profile.fullName || profile.email || profile.userName}</h2>
          <p>{profile.email}</p>
        </div>
        <div className={styles["role-list"]}>
          {(profile.roles?.length ? profile.roles : ["User"]).map((role) => (
            <span key={role}>{role}</span>
          ))}
        </div>
      </section>

      {(error || success) && (
        <div className={error ? styles.noticeError : styles.noticeSuccess}>
          {error || success}
        </div>
      )}

      <section className={styles["stats-grid"]}>
        <div>
          <span>Total balance</span>
          <strong>{formatMoney(stats.totalBalance)}</strong>
        </div>
        <div>
          <span>Accounts</span>
          <strong>{stats.accountsCount || 0}</strong>
        </div>
        <div>
          <span>Transactions</span>
          <strong>{stats.transactionsCount || 0}</strong>
        </div>
        <div>
          <span>Budget plans</span>
          <strong>{stats.budgetPlansCount || 0}</strong>
        </div>
        <div>
          <span>Goals</span>
          <strong>{stats.financialGoalsCount || 0}</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>{stats.categoriesCount || 0}</strong>
        </div>
      </section>

      <div className={styles.grid}>
        <form className={styles.panel} onSubmit={saveProfile}>
          <div className={styles["panel-header"]}>
            <h3>Personal information</h3>
            <span>Edit account details</span>
          </div>

          <label>
            Full name
            <input
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Your name"
            />
          </label>

          <label>
            Username
            <input
              value={form.userName}
              onChange={(event) => updateField("userName", event.target.value)}
              placeholder="Username"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="email@example.com"
            />
          </label>

          <label>
            Phone
            <input
              value={form.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              placeholder="+380..."
            />
          </label>

          <button disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </form>

        <form className={styles.panel} onSubmit={changePassword}>
          <div className={styles["panel-header"]}>
            <h3>Security</h3>
            <span>Password and account status</span>
          </div>

          <div className={styles["status-grid"]}>
            {statusItems.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong className={item.good ? styles.good : styles.muted}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                updatePasswordField("currentPassword", event.target.value)
              }
              autoComplete="current-password"
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                updatePasswordField("newPassword", event.target.value)
              }
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                updatePasswordField("confirmPassword", event.target.value)
              }
              autoComplete="new-password"
            />
          </label>

          {passwordMessage && (
            <p
              className={
                passwordMessage === "Password changed."
                  ? styles.passwordSuccess
                  : styles.passwordError
              }
            >
              {passwordMessage}
            </p>
          )}

          <button disabled={changingPassword}>
            {changingPassword ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
