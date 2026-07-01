import { useState, useEffect, useRef } from "react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";

function useIndianTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const istOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata" };
  const dateStr = now.toLocaleDateString("en-IN", {
    ...istOptions,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    ...istOptions,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { dateStr, timeStr };
}

function UploadPage({ onGo }: { onGo: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Pass Viewer</h1>
        <p className="text-gray-500 text-sm text-center">Upload your pass image, then tap Go to view it with live Indian time.</p>

        <div
          className="w-full h-48 border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-contain rounded-xl" />
          ) : (
            <>
              <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4m0 0l4-4m-4 4h12M4 20h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12" />
              </svg>
              <span className="text-blue-500 font-medium text-sm">Tap to upload image</span>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <button
          disabled={!preview}
          onClick={() => preview && onGo(preview)}
          className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all"
          style={{
            background: preview ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#d1d5db",
            cursor: preview ? "pointer" : "not-allowed",
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
}

function DisplayPage({ imageUrl, onBack }: { imageUrl: string; onBack: () => void }) {
  const { dateStr, timeStr } = useIndianTime();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between py-4 px-2">
      <div className="w-full max-w-sm flex-1 flex flex-col">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-blue-600 font-medium text-sm self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1">
          <img
            src={imageUrl}
            alt="pass"
            className="w-full object-contain"
            style={{ maxHeight: "70vh" }}
          />
        </div>
      </div>

      <div className="w-full max-w-sm mt-4">
        <div
          className="rounded-2xl shadow-lg py-5 px-4 flex flex-col items-center"
          style={{ background: "#f0f4ff", borderTop: "3px solid #2563eb" }}
        >
          <p className="text-blue-700 font-semibold text-base tracking-widest mb-1">{dateStr}</p>
          <p
            className="font-bold tabular-nums"
            style={{ fontSize: "3rem", color: "#1e3a8a", letterSpacing: "0.05em", lineHeight: 1 }}
          >
            {timeStr}
          </p>
          <p className="text-xs text-gray-400 mt-1">Indian Standard Time (IST)</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDisplay, setShowDisplay] = useState(false);

  const handleGo = (url: string) => {
    setImageUrl(url);
    setShowDisplay(true);
  };

  const handleBack = () => {
    setShowDisplay(false);
  };

  if (showDisplay && imageUrl) {
    return <DisplayPage imageUrl={imageUrl} onBack={handleBack} />;
  }

  return <UploadPage onGo={handleGo} />;
}
