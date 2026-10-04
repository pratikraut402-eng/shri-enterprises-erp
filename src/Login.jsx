import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("shriERPLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>SE</div>

        <h1 style={styles.title}>Shri Enterprises</h1>
        <div style={styles.subtitle}>& Beverages</div>

        <div style={styles.heading}>ERP Login</div>
        <div style={styles.text}>
          Sign in to access your business dashboard
        </div>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={styles.input}
            autoComplete="username"
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={styles.input}
            autoComplete="current-password"
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <div style={styles.footer}>
          Shri ERP • Version 1.0
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #EEF3F8, #DDE8F5)",
    fontFamily: "Inter, Arial, sans-serif",
  },

  card: {
    width: "390px",
    maxWidth: "90%",
    background: "#FFFFFF",
    borderRadius: "18px",
    padding: "38px",
    boxSizing: "border-box",
    boxShadow: "0 18px 50px rgba(30, 55, 90, 0.15)",
    textAlign: "center",
  },

  logo: {
    width: "64px",
    height: "64px",
    margin: "0 auto 14px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4A8CF5, #245BC0)",
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: "900",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "900",
    color: "#172033",
  },

  subtitle: {
    marginTop: "3px",
    color: "#3479D9",
    fontSize: "14px",
    fontWeight: "700",
  },

  heading: {
    marginTop: "30px",
    fontSize: "20px",
    fontWeight: "850",
    color: "#172033",
  },

  text: {
    marginTop: "6px",
    marginBottom: "24px",
    color: "#7A8797",
    fontSize: "12px",
  },

  label: {
    display: "block",
    textAlign: "left",
    marginBottom: "7px",
    marginTop: "15px",
    color: "#465568",
    fontSize: "12px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #D2DCE8",
    borderRadius: "9px",
    padding: "12px 13px",
    outline: "none",
    fontSize: "13px",
    background: "#FBFCFE",
  },

  error: {
    marginTop: "12px",
    padding: "9px",
    borderRadius: "7px",
    background: "#FFF0F0",
    color: "#D94343",
    fontSize: "11px",
    fontWeight: "700",
  },

  button: {
    width: "100%",
    marginTop: "22px",
    border: "none",
    borderRadius: "9px",
    padding: "13px",
    background: "linear-gradient(135deg, #3E82EA, #245FC8)",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "850",
    cursor: "pointer",
  },

  footer: {
    marginTop: "25px",
    color: "#9AA6B5",
    fontSize: "9px",
  },
};

export default Login;

