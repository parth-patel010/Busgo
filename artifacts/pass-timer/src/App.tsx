import { useState, useEffect, useRef } from "react";

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

  return {
    dateStr: `${dd}-${mm}-${yyyy}`,
    timeStr: `${hh}:${min}:${ss}`,
  };
}

function UploadPage({ onGo }: { onGo: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f3f4f6",
      padding: "24px 16px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "32px 24px",
        width: "100%",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>
          Pass Viewer
        </h1>

        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%",
            height: "190px",
            border: "2px dashed #60a5fa",
            borderRadius: "14px",
            background: "#eff6ff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <>
              <svg width="36" height="36" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 4 4 4-6 4 6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M12 4v8" />
              </svg>
              <span style={{ color: "#3b82f6", fontWeight: 500, fontSize: "14px", marginTop: "8px" }}>
                Tap to upload image
              </span>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

        <button
          disabled={!preview}
          onClick={() => preview && onGo(preview)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: preview ? "#2563eb" : "#d1d5db",
            color: "#fff",
            fontWeight: 700,
            fontSize: "17px",
            cursor: preview ? "pointer" : "not-allowed",
            letterSpacing: "0.5px",
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
}

function DisplayPage({ imageUrl }: { imageUrl: string }) {
  const { dateStr, timeStr } = useIndianTime();

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: "#fff",
    }}>
      {/* Image fills all remaining space */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <img
          src={imageUrl}
          alt="pass"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
        />
      </div>

      {/* Timer section */}
      <div style={{
        background: "#f0f2f5",
        padding: "18px 0 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        gap: "2px",
      }}>
        <p style={{
          color: "#1a2744",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
        }}>
          {dateStr}
        </p>
        <p style={{
          color: "#1a2744",
          fontSize: "52px",
          fontWeight: 800,
          letterSpacing: "2px",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
        }}>
          {timeStr}
        </p>
        <button style={{
          marginTop: "14px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "11px 28px",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "0.3px",
          cursor: "pointer",
        }}>
          Register for Transport
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  if (imageUrl) {
    return <DisplayPage imageUrl={imageUrl} />;
  }

  return <UploadPage onGo={setImageUrl} />;
}
