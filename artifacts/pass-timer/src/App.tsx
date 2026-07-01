import { useState, useEffect, useRef } from "react";

const POPPINS = "'Poppins', sans-serif";
const API = "/api";

type AuthUser = { id: number; username: string; active: boolean; isAdmin: boolean } | null;

function useIndianTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const dd = String(ist.getDate()).padStart(2, "0");
  const mm = String(ist.getMonth() + 1).padStart(2, "0");
  const yyyy = ist.getFullYear();
  const hh = String(ist.getHours()).padStart(2, "0");
  const min = String(ist.getMinutes()).padStart(2, "0");
  const ss = String(ist.getSeconds()).padStart(2, "0");
  return { dateStr: `${dd}-${mm}-${yyyy}`, timeStr: `${hh}:${min}:${ss}` };
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res;
}

/* ─── Login ─── */
function LoginPage({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Login failed"); return; }
    onLogin(data);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "36px 28px", width: "100%", maxWidth: "360px" }}>
        <h1 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "22px", color: "#1a2744", textAlign: "center", marginBottom: "6px" }}>Pass Viewer</h1>
        <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#6b7280", textAlign: "center", marginBottom: "24px" }}>Sign in to continue</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
            style={{ fontFamily: POPPINS, fontSize: "14px", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", outline: "none", color: "#1a2744" }}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ fontFamily: POPPINS, fontSize: "14px", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", outline: "none", color: "#1a2744" }}
          />
          {error && <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "15px", padding: "12px", borderRadius: "10px", border: "none", background: "#1a2744", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Inactive ─── */
function InactivePage({ user, onLogout }: { user: NonNullable<AuthUser>; onLogout: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "36px 28px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
        <h2 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "20px", color: "#1a2744", marginBottom: "8px" }}>Account Not Active</h2>
        <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Hello, <strong>{user.username}</strong></p>
        <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Your account is pending activation. Please join our Telegram group to get activated.</p>
        <a
          href="https://t.me/+SZcBfxbtoP1hYzU1"
          target="_blank" rel="noopener noreferrer"
          style={{ display: "block", fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", padding: "11px 20px", borderRadius: "10px", background: "#229ED9", color: "#fff", textDecoration: "none", marginBottom: "12px" }}
        >
          Join Telegram Group
        </a>
        <button onClick={onLogout} style={{ fontFamily: POPPINS, fontSize: "13px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Logout</button>
      </div>
    </div>
  );
}

/* ─── Upload ─── */
function UploadPage({ onGo, user, onLogout }: { onGo: (url: string) => void; user: NonNullable<AuthUser>; onLogout: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: "24px 16px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "32px 24px", width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h1 style={{ fontFamily: POPPINS, fontSize: "20px", fontWeight: 700, color: "#1a2744", margin: 0 }}>Pass Viewer</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {user.isAdmin && (
              <button onClick={() => onGo("__admin__")} style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 600, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", color: "#374151" }}>Admin</button>
            )}
            <button onClick={onLogout} style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 500, background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
        <div
          onClick={() => fileRef.current?.click()}
          style={{ width: "100%", height: "190px", border: "2px dashed #60a5fa", borderRadius: "14px", background: "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <>
              <svg width="36" height="36" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 4 4 4-6 4 6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M12 4v8" />
              </svg>
              <span style={{ fontFamily: POPPINS, color: "#3b82f6", fontWeight: 500, fontSize: "14px", marginTop: "8px" }}>Tap to upload image</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button
          disabled={!preview}
          onClick={() => preview && onGo(preview)}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: preview ? "#2563eb" : "#d1d5db", color: "#fff", fontWeight: 700, fontSize: "17px", cursor: preview ? "pointer" : "not-allowed", fontFamily: POPPINS }}
        >Go</button>
      </div>
    </div>
  );
}

/* ─── Display ─── */
function DisplayPage({ imageUrl, onBack }: { imageUrl: string; onBack: () => void }) {
  const { dateStr, timeStr } = useIndianTime();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div>
        <img src={imageUrl} alt="pass" style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ background: "#f0f2f5", padding: "18px 0 22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: "2px" }}>
        <p style={{ color: "#1a2744", fontSize: "15px", fontWeight: 500, letterSpacing: "0.5px", fontFamily: POPPINS, margin: 0 }}>{dateStr}</p>
        <p style={{ color: "#1a2744", fontSize: "40px", fontWeight: 500, letterSpacing: "2px", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", fontFamily: POPPINS, margin: 0 }}>{timeStr}</p>
        <a
          href="https://t.me/+SZcBfxbtoP1hYzU1"
          target="_blank" rel="noopener noreferrer"
          style={{ marginTop: "10px", display: "inline-block", background: "#000", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 20px", fontSize: "14px", fontWeight: 600, fontFamily: POPPINS, letterSpacing: "0.3px", textDecoration: "none" }}
        >
          Register for Transport
        </a>
        <button onClick={onBack} style={{ marginTop: "8px", background: "none", border: "none", color: "#9ca3af", fontSize: "12px", fontFamily: POPPINS, cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );
}

/* ─── Admin ─── */
type UserRow = { id: number; username: string; active: boolean; isAdmin: boolean; createdAt: string };

function AdminPage({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await apiFetch("/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u: UserRow) => {
    await apiFetch(`/admin/users/${u.id}/active`, { method: "PATCH", body: JSON.stringify({ active: !u.active }) });
    load();
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch("/admin/users", { method: "POST", body: JSON.stringify({ ...newUser, active: false }) });
    if (res.ok) { setNewUser({ username: "", password: "" }); setMsg("User added!"); load(); setTimeout(() => setMsg(""), 2000); }
    else { const d = await res.json(); setMsg(d.error ?? "Error"); }
  };

  const deleteUser = async (id: number) => {
    await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "20px 16px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: POPPINS, color: "#6b7280", fontSize: "13px" }}>← Back</button>
          <h2 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "18px", color: "#1a2744", margin: 0 }}>User Management</h2>
        </div>

        {/* Add user */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", color: "#374151", margin: "0 0 12px" }}>Add New User</h3>
          <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="Username" required style={{ fontFamily: POPPINS, fontSize: "13px", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", outline: "none" }} />
            <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Password" required style={{ fontFamily: POPPINS, fontSize: "13px", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", outline: "none" }} />
            <button type="submit" style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "13px", padding: "9px", borderRadius: "8px", border: "none", background: "#1a2744", color: "#fff", cursor: "pointer" }}>Add User</button>
            {msg && <p style={{ fontFamily: POPPINS, fontSize: "12px", color: "#10b981", margin: 0, textAlign: "center" }}>{msg}</p>}
          </form>
        </div>

        {/* User list */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <p style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", color: "#1a2744", margin: 0 }}>{u.username}{u.isAdmin && <span style={{ marginLeft: "6px", fontSize: "10px", background: "#dbeafe", color: "#1d4ed8", borderRadius: "4px", padding: "2px 6px" }}>admin</span>}</p>
                <p style={{ fontFamily: POPPINS, fontSize: "11px", color: u.active ? "#10b981" : "#ef4444", margin: 0 }}>{u.active ? "Active" : "Inactive"}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={() => toggleActive(u)} style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 600, padding: "5px 12px", borderRadius: "6px", border: "none", background: u.active ? "#fef2f2" : "#f0fdf4", color: u.active ? "#ef4444" : "#10b981", cursor: "pointer" }}>
                  {u.active ? "Deactivate" : "Activate"}
                </button>
                {!u.isAdmin && (
                  <button onClick={() => deleteUser(u.id)} style={{ fontFamily: POPPINS, fontSize: "11px", padding: "5px 10px", borderRadius: "6px", border: "none", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}>✕</button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px" }}>No users yet</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Root ─── */
export default function App() {
  const [user, setUser] = useState<AuthUser>(null);
  const [checking, setChecking] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/auth/me").then(async res => {
      if (res.ok) setUser(await res.json());
      setChecking(false);
    });
  }, []);

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    setImageUrl(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <p style={{ fontFamily: POPPINS, color: "#9ca3af", fontSize: "14px" }}>Loading…</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={setUser} />;
  if (!user.active && !user.isAdmin) return <InactivePage user={user} onLogout={logout} />;
  if (imageUrl === "__admin__") return <AdminPage onBack={() => setImageUrl(null)} />;
  if (imageUrl) return <DisplayPage imageUrl={imageUrl} onBack={() => setImageUrl(null)} />;
  return <UploadPage onGo={setImageUrl} user={user} onLogout={logout} />;
}
