import { useState, useEffect, useRef } from "react";

const POPPINS = "'Poppins', sans-serif";
const API = "/api";

type AuthUser = {
  id: number;
  username: string;
  active: boolean;
  isAdmin: boolean;
  photoUrl: string | null;
} | null;

type UserRow = {
  id: number;
  username: string;
  active: boolean;
  isAdmin: boolean;
  photoUrl: string | null;
  createdAt: string;
};

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
  return fetch(`${API}${path}`, { credentials: "include", ...opts });
}

/* ─── Login ─── */
function LoginPage({ onLogin }: { onLogin: (u: NonNullable<AuthUser>) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required
            style={{ fontFamily: POPPINS, fontSize: "14px", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", outline: "none", color: "#1a2744" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
            style={{ fontFamily: POPPINS, fontSize: "14px", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", outline: "none", color: "#1a2744" }} />
          {error && <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "15px", padding: "12px", borderRadius: "10px", border: "none", background: "#1a2744", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
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
        <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Your account is pending activation. Join our Telegram group to get activated.</p>
        <a href="https://t.me/+SZcBfxbtoP1hYzU1" target="_blank" rel="noopener noreferrer"
          style={{ display: "block", fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", padding: "11px 20px", borderRadius: "10px", background: "#229ED9", color: "#fff", textDecoration: "none", marginBottom: "12px" }}>
          Join Telegram Group
        </a>
        <button onClick={onLogout} style={{ fontFamily: POPPINS, fontSize: "13px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Logout</button>
      </div>
    </div>
  );
}

/* ─── Display (user's assigned photo) ─── */
function DisplayPage({ imageUrl, onBack, onLogout }: { imageUrl: string; onBack?: () => void; onLogout: () => void }) {
  const { dateStr, timeStr } = useIndianTime();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div>
        <img src={imageUrl} alt="pass" style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ background: "#f0f2f5", padding: "18px 0 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <p style={{ color: "#1a2744", fontSize: "15px", fontWeight: 500, letterSpacing: "0.5px", fontFamily: POPPINS, margin: 0 }}>{dateStr}</p>
        <p style={{ color: "#1a2744", fontSize: "40px", fontWeight: 500, letterSpacing: "2px", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", fontFamily: POPPINS, margin: 0 }}>{timeStr}</p>
        <a href="https://t.me/+SZcBfxbtoP1hYzU1" target="_blank" rel="noopener noreferrer"
          style={{ marginTop: "10px", display: "inline-block", background: "#000", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 20px", fontSize: "14px", fontWeight: 600, fontFamily: POPPINS, letterSpacing: "0.3px", textDecoration: "none" }}>
          Register for Transport
        </a>
        <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "12px", fontFamily: POPPINS, cursor: "pointer" }}>← Upload different</button>
          )}
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "12px", fontFamily: POPPINS, cursor: "pointer" }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload (fallback for users without assigned photo) ─── */
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {user.isAdmin && (
              <button onClick={() => onGo("__admin__")} style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 600, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", color: "#374151" }}>Admin</button>
            )}
            <button onClick={onLogout} style={{ fontFamily: POPPINS, fontSize: "11px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
        <div onClick={() => fileRef.current?.click()}
          style={{ width: "100%", height: "190px", border: "2px dashed #60a5fa", borderRadius: "14px", background: "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
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
        <button disabled={!preview} onClick={() => preview && onGo(preview)}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: preview ? "#2563eb" : "#d1d5db", color: "#fff", fontWeight: 700, fontSize: "17px", cursor: preview ? "pointer" : "not-allowed", fontFamily: POPPINS }}>
          Go
        </button>
      </div>
    </div>
  );
}

/* ─── Admin ─── */
function AdminPage({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await apiFetch("/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u: UserRow) => {
    await apiFetch(`/admin/users/${u.id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    load();
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "20px 16px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: POPPINS, color: "#6b7280", fontSize: "13px" }}>← Back</button>
            <h2 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "18px", color: "#1a2744", margin: 0 }}>User Management</h2>
          </div>
          <button onClick={() => setShowAdd(true)}
            style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "13px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "#1a2744", color: "#fff", cursor: "pointer" }}>
            + Add User
          </button>
        </div>

        {msg && <div style={{ fontFamily: POPPINS, fontSize: "13px", background: "#f0fdf4", color: "#10b981", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", textAlign: "center" }}>{msg}</div>}

        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", background: "#f3f4f6", flexShrink: 0 }}>
                {u.photoUrl
                  ? <img src={u.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "18px" }}>👤</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", color: "#1a2744", margin: 0 }}>
                  {u.username}
                  {u.isAdmin && <span style={{ marginLeft: "6px", fontSize: "10px", background: "#dbeafe", color: "#1d4ed8", borderRadius: "4px", padding: "2px 6px" }}>admin</span>}
                </p>
                <p style={{ fontFamily: POPPINS, fontSize: "11px", color: u.active ? "#10b981" : "#ef4444", margin: 0 }}>
                  {u.active ? "✓ Active" : "✗ Inactive"} · {u.photoUrl ? "Photo set" : "No photo"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button onClick={() => setEditUser(u)}
                  style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 600, padding: "5px 10px", borderRadius: "6px", border: "none", background: "#f3f4f6", color: "#374151", cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={() => toggleActive(u)}
                  style={{ fontFamily: POPPINS, fontSize: "11px", fontWeight: 600, padding: "5px 10px", borderRadius: "6px", border: "none", background: u.active ? "#fef2f2" : "#f0fdf4", color: u.active ? "#ef4444" : "#10b981", cursor: "pointer" }}>
                  {u.active ? "Off" : "On"}
                </button>
                {!u.isAdmin && (
                  <button onClick={() => deleteUser(u.id)}
                    style={{ fontFamily: POPPINS, fontSize: "11px", padding: "5px 8px", borderRadius: "6px", border: "none", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}>✕</button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && <p style={{ fontFamily: POPPINS, fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px" }}>No users yet</p>}
        </div>
      </div>

      {showAdd && <UserFormModal title="Add User" onClose={() => setShowAdd(false)} onSave={async (fd) => {
        const res = await apiFetch("/admin/users", { method: "POST", body: fd });
        if (res.ok) { flash("User added!"); load(); setShowAdd(false); }
        else { const d = await res.json(); flash(d.error ?? "Error"); }
      }} />}

      {editUser && <UserFormModal title={`Edit: ${editUser.username}`} user={editUser} onClose={() => setEditUser(null)} onSave={async (fd) => {
        const res = await apiFetch(`/admin/users/${editUser.id}`, { method: "PATCH", body: fd });
        if (res.ok) { flash("User updated!"); load(); setEditUser(null); }
        else { const d = await res.json(); flash(d.error ?? "Error"); }
      }} />}
    </div>
  );
}

/* ─── User Form Modal (Add / Edit) ─── */
function UserFormModal({
  title, user, onClose, onSave,
}: {
  title: string;
  user?: UserRow;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(user?.active ?? false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("username", username);
    if (password) fd.append("password", password);
    fd.append("active", String(active));
    if (photoFile) fd.append("photo", photoFile);
    await onSave(fd);
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "400px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "16px", color: "#1a2744", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Photo upload */}
          <div>
            <label style={{ fontFamily: POPPINS, fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "8px" }}>Pass Photo</label>
            <div onClick={() => fileRef.current?.click()}
              style={{ width: "100%", height: "160px", border: "2px dashed #d1d5db", borderRadius: "12px", background: "#f9fafb", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoPreview
                ? <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : <span style={{ fontFamily: POPPINS, fontSize: "13px", color: "#9ca3af" }}>Tap to upload photo</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </div>

          <div>
            <label style={{ fontFamily: POPPINS, fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required
              style={{ fontFamily: POPPINS, fontSize: "14px", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontFamily: POPPINS, fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>
              Password {user && <span style={{ fontWeight: 400, color: "#9ca3af" }}>(leave blank to keep)</span>}
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? "New password (optional)" : "Password"} required={!user}
              style={{ fontFamily: POPPINS, fontSize: "14px", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#1a2744" }} />
            <span style={{ fontFamily: POPPINS, fontSize: "13px", fontWeight: 500, color: "#374151" }}>Active (can log in and use the app)</span>
          </label>

          <button type="submit" disabled={saving}
            style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "14px", padding: "12px", borderRadius: "10px", border: "none", background: "#1a2744", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : user ? "Save Changes" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Root ─── */
export default function App() {
  const [user, setUser] = useState<AuthUser>(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState<"main" | "admin" | "upload-display">("main");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/auth/me").then(async res => {
      if (res.ok) setUser(await res.json());
      setChecking(false);
    });
  }, []);

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    setPage("main");
    setUploadedUrl(null);
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
  if (page === "admin") return <AdminPage onBack={() => setPage("main")} />;

  // Regular user with admin-assigned photo — show directly
  if (user.photoUrl && page === "main") {
    return <DisplayPage imageUrl={user.photoUrl} onLogout={logout}
      onBack={user.isAdmin ? () => { setPage("main"); } : undefined} />;
  }

  // Admin or user without photo — show upload then display
  if (page === "upload-display" && uploadedUrl) {
    return <DisplayPage imageUrl={uploadedUrl} onBack={() => { setPage("main"); setUploadedUrl(null); }} onLogout={logout} />;
  }

  return <UploadPage user={user} onLogout={logout} onGo={(url) => {
    if (url === "__admin__") { setPage("admin"); return; }
    setUploadedUrl(url);
    setPage("upload-display");
  }} />;
}
