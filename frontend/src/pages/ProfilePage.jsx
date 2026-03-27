import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  username: "",
  email: "",
  phone: "",
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await updateProfile(form);
      setSuccess(res.message || "Profile updated");
    } catch (err) {
      setError(err?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="profile-header">
        <div>
          <h2 className="page-title">Profile</h2>
          <p className="wallet-note">
            Manage your real name, gamer ID, email, and phone number.
          </p>
        </div>
        <div className="profile-badge">
          <span className="balance-label">GAMER ID</span>
          <strong>{user?.username || "Not set yet"}</strong>
        </div>
      </div>

      {error && <div className="toast err">{error}</div>}
      {success && <div className="toast ok">{success}</div>}

      <form className="profile-card" onSubmit={handleSubmit}>
        <div className="profile-grid">
          <div>
            <label className="field-label" htmlFor="name">
              Actual Name
            </label>
            <input
              id="name"
              className="inp"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="username">
              Gamer ID
            </label>
            <input
              id="username"
              className="inp"
              type="text"
              name="username"
              placeholder="letters_numbers_only"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="inp"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              className="inp"
              type="tel"
              name="phone"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="profile-actions">
          <p className="wallet-note">
            Your gamer ID is what other players can recognize inside the game.
          </p>
          <button type="submit" className="save-btn profile-save" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
