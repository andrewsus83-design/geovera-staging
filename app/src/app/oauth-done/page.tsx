"use client";
import { useEffect, useState } from "react";

/**
 * /oauth-done
 *
 * Landing page after Late OAuth callback.
 * Configure Late dashboard redirect URL → https://app.geovera.xyz/oauth-done
 *
 * Behaviour:
 *  1. Sends postMessage to parent window (if in popup)
 *  2. Auto-closes the popup
 *  3. Falls back gracefully if opened as full page (redirects to /)
 */
export default function OAuthDonePage() {
  const [status, setStatus] = useState<"closing" | "fallback">("closing");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Send success message to opener (the GeoVera dashboard tab)
    if (window.opener) {
      try {
        window.opener.postMessage(
          { type: "gv_oauth_done" },
          window.location.origin
        );
      } catch {
        // opener may be cross-origin in some edge cases — ignore
      }
      // Close the popup
      window.close();
      // If window.close() didn't work, show fallback UI
      setTimeout(() => setStatus("fallback"), 500);
    } else {
      // Opened as full page (not popup) — redirect to home
      setStatus("fallback");
      setTimeout(() => {
        window.location.replace("/?oauth_done=1");
      }, 1500);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0fdf4",
        fontFamily: "system-ui, -apple-system, sans-serif",
        gap: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      {status === "closing" ? (
        <>
          <div style={{ fontSize: 48 }}>✅</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#14532d" }}>
            Terhubung!
          </h1>
          <p style={{ fontSize: 14, color: "#4b5563" }}>
            Menutup window…
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48 }}>✅</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#14532d" }}>
            Berhasil terhubung!
          </h1>
          <p style={{ fontSize: 14, color: "#4b5563" }}>
            Kembali ke dashboard GeoVera dan refresh halaman.
          </p>
          <a
            href="/"
            style={{
              marginTop: 8,
              padding: "10px 24px",
              background: "#16a34a",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Kembali ke Dashboard
          </a>
        </>
      )}
    </div>
  );
}
