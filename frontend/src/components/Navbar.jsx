export default function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">BetCard</div>

      <div className="nav-links">
        {[
          ["game", "Game"],
          ["wallet", "Wallet"],
          ["profile", "Profile"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`nav-btn ${page === key ? "active" : ""}`}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <div className="profile-pill">
          <span className="profile-pill-name">{user.username || user.name}</span>
          <span className="profile-pill-sub">{user.email}</span>
        </div>
        <span className="bal-badge">
          Rs. {Number(user.balance || 0).toLocaleString("en-IN")}
        </span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
