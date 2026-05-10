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

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: var(--bg);
  }

  .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0.35; }
  .orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #7c6af7 0%, transparent 70%);
    top: -150px; right: -150px;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
    bottom: -100px; left: -100px;
    animation: drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes drift {
    from { transform: translate(0, 0); }
    to   { transform: translate(40px, 30px); }
  }

  .grid-bg {
    position: absolute; inset: 0;
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

  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), #3b82f6);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }

  .heading { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.8px; margin-bottom: 6px; }
  .subtext { font-size: 14px; color: var(--muted); margin-bottom: 36px; font-weight: 300; }

  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
  .input-wrap { position: relative; }
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
  .input-wrap input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .input-wrap input::placeholder { color: var(--muted); }
  .input-wrap input.error-input { border-color: var(--error); }

  .toggle-pw {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--muted);
    font-size: 16px; padding: 2px; line-height: 1; transition: color 0.2s;
  }
  .toggle-pw:hover { color: var(--text); }

  .field-error { margin-top: 6px; font-size: 12px; color: var(--error); }

  .strength-bar {
    margin-top: 8px;
    height: 3px;
    border-radius: 99px;
    background: var(--border);
    overflow: hidden;
  }
  .strength-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.3s, background 0.3s;
  }
  .strength-label { margin-top: 5px; font-size: 11px; color: var(--muted); }

  .btn-register {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, var(--accent), #6055e8);
    border: none; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    color: #fff; cursor: pointer; letter-spacing: 0.3px;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 20px var(--accent-glow);
    margin-top: 8px;
  }
  .btn-register:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,106,247,0.4); }
  .btn-register:active:not(:disabled) { transform: translateY(0); }
  .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; color: var(--muted); font-size: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .login-row { text-align: center; font-size: 13px; color: var(--muted); }
  .login-row a { color: var(--accent); text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
  .login-row a:hover { opacity: 0.7; }

  .toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%);
    padding: 12px 22px; border-radius: 10px;
    font-size: 14px; font-weight: 500;
    animation: toastIn 0.3s ease both; z-index: 999;
  }
  .toast.success { background: #14532d; color: var(--success); border: 1px solid #166534; }
  .toast.error   { background: #450a0a; color: var(--error);   border: 1px solid #7f1d1d; }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short",  color: "#f87171" },
    { label: "Weak",       color: "#fb923c" },
    { label: "Fair",       color: "#facc15" },
    { label: "Good",       color: "#a3e635" },
    { label: "Strong",     color: "#4ade80" },
    { label: "Very strong",color: "#34d399" },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const [form, setForm]     = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const navigate            = useNavigate();

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.username.trim())          e.username = "Username is required";
    else if (form.username.length < 3)  e.username = "At least 3 characters";
    if (!form.email.trim())             e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.password)                 e.password = "Password is required";
    else if (form.password.length < 4)  e.password = "At least 4 characters";
    if (!form.confirm)                  e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    return e;
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email:    form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Account created! Redirecting to sign in…", "success");
        setForm({ username: "", email: "", password: "", confirm: "" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch {
      showToast("Cannot reach server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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

          <h1 className="heading">Create account</h1>
          <p className="subtext">Join Nexus and get started today</p>

          {/* Username */}
          <div className="field">
            <label>Username</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="choose_a_username"
                className={errors.username ? "error-input" : ""}
                value={form.username}
                onChange={set("username")}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                className={errors.email ? "error-input" : ""}
                value={form.email}
                onChange={set("email")}
                onKeyDown={handleKey}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="field-error">{errors.email}</div>}
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
                onChange={set("password")}
                onKeyDown={handleKey}
                autoComplete="new-password"
                style={{ paddingRight: "42px" }}
              />
              <button className="toggle-pw" onClick={() => setShowPw(!showPw)} tabIndex={-1} type="button">
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
            {form.password && (
              <>
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                  />
                </div>
                <div className="strength-label">{strength.label}</div>
              </>
            )}
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          {/* Confirm */}
          <div className="field">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <input
                type={showCf ? "text" : "password"}
                placeholder="••••••••"
                className={errors.confirm ? "error-input" : ""}
                value={form.confirm}
                onChange={set("confirm")}
                onKeyDown={handleKey}
                autoComplete="new-password"
                style={{ paddingRight: "42px" }}
              />
              <button className="toggle-pw" onClick={() => setShowCf(!showCf)} tabIndex={-1} type="button">
                {showCf ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          </div>

          <button className="btn-register" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Creating account…" : "Create account"}
          </button>

          <div className="divider">or</div>

          <div className="login-row">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
