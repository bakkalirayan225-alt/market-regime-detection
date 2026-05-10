import { useState } from "react";
import { useNavigate } from "react-router-dom";



const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --border: #1e1e2e;
    --accent: #7c6af7;
    --accent-glow: rgba(124, 106, 247, 0.25);
    --text: #e8e8f0;
    --muted: #5a5a72;
    --error: #f87171;
    --success: #4ade80;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: var(--bg);
  }

  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    opacity: 0.35;
  }
  .orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #7c6af7 0%, transparent 70%);
    top: -150px; left: -150px;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation: drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes drift {
    from { transform: translate(0, 0); }
    to   { transform: translate(40px, 30px); }
  }

  .grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,106,247,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,106,247,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .card {
    position: relative;
    width: 440px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 48px;
    box-shadow:
      0 0 0 1px rgba(124,106,247,0.08),
      0 32px 64px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.04);
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), #3b82f6);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
    color: var(--text);
  }

  .heading {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: var(--text);
    margin-bottom: 6px;
  }
  .subtext {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 36px;
    font-weight: 300;
  }

  .field {
    margin-bottom: 20px;
  }
  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .input-wrap {
    position: relative;
  }
  .input-wrap input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-wrap input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .input-wrap input::placeholder { color: var(--muted); }
  .input-wrap input.error-input { border-color: var(--error); }

  .toggle-pw {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    font-size: 16px;
    padding: 2px;
    line-height: 1;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: var(--text); }

  .field-error {
    margin-top: 6px;
    font-size: 12px;
    color: var(--error);
  }

  .row-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .remember {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--muted);
    user-select: none;
  }
  .remember input[type=checkbox] { accent-color: var(--accent); width: 14px; height: 14px; }
  .forgot {
    font-size: 13px;
    color: var(--accent);
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .forgot:hover { opacity: 0.7; }

  .btn-login {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--accent), #6055e8);
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 20px var(--accent-glow);
  }
  .btn-login:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(124,106,247,0.4);
  }
  .btn-login:active:not(:disabled) { transform: translateY(0); }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    color: var(--muted);
    font-size: 12px;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .signup-row {
    text-align: center;
    font-size: 13px;
    color: var(--muted);
  }
  .signup-row a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .signup-row a:hover { opacity: 0.7; }

  .toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    padding: 12px 22px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    animation: toastIn 0.3s ease both;
    z-index: 999;
  }
  .toast.success { background: #14532d; color: var(--success); border: 1px solid #166534; }
  .toast.error   { background: #450a0a; color: var(--error);   border: 1px solid #7f1d1d; }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate(); 

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 4) e.password = "Password too short";
    return e;
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();

      if (res.ok) {
  // ✅ STORE TOKEN + USER
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  showToast(`Welcome back, ${form.username}!`, "success");

  setTimeout(() => navigate("/market-select"), 1000);
} else {
        showToast(data.error || "Invalid credentials", "error");
      }
    } catch {
      showToast("Cannot reach server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <style>{styles}</style>

      <div className="page">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="grid-bg" />

        <div className="card">
          <div className="logo-row">
            <div className="logo-icon">⬡</div>
            <span className="logo-text">Nexus</span>
          </div>

          <h1 className="heading">Welcome back</h1>
          <p className="subtext">Sign in to continue to your dashboard</p>

          {/* Username */}
          <div className="field">
            <label>Username</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="your_username"
                className={errors.username ? "error-input" : ""}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className={errors.password ? "error-input" : ""}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
                autoComplete="current-password"
                style={{ paddingRight: "42px" }}
              />
              <button
                className="toggle-pw"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                type="button"
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          {/* Remember / Forgot */}
          <div className="row-between">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          {/* Submit */}
          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="divider">or</div>

          <div className="signup-row">
            Don't have an account? <a href="/register">Create one</a>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
