import React from "react";
import ReactDOM from "react-dom/client";

const environments = {
  development: {
    label: "Development",
    url: "http://localhost:3901"
  },
  production: {
    label: "Production",
    url: "https://app.farm-oss.app"
  },
  staging: {
    label: "Staging",
    url: "https://staging.farm-oss.app"
  }
} as const;

type EnvironmentName = keyof typeof environments;

function getEnvironmentName(): EnvironmentName {
  const value = (import.meta.env.VITE_FARM_OSS_ENV ?? "development").toLowerCase();

  if (value === "staging" || value === "production") {
    return value;
  }

  return "development";
}

const activeEnvironment = environments[getEnvironmentName()];

function App() {
  return (
    <main
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at top left, rgba(238, 176, 64, 0.18), transparent 30%), linear-gradient(180deg, #122216 0%, #0b130d 100%)",
        color: "#f4eedc",
        display: "grid",
        fontFamily: "Georgia, 'Times New Roman', serif",
        minHeight: "100vh",
        padding: "2rem"
      }}
    >
      <section
        style={{
          backdropFilter: "blur(18px)",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "28px",
          display: "grid",
          gap: "1rem",
          margin: "0 auto",
          maxWidth: "760px",
          padding: "2rem",
          width: "100%"
        }}
      >
        <p style={{ color: "#eeb040", letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
          Desktop
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 1, margin: 0 }}>
          Farm OSS desktop shell is ready.
        </h1>
        <p style={{ lineHeight: 1.8, margin: 0 }}>
          This app follows the Midday desktop setup pattern with Tauri and Vite, adapted for the farm dashboard.
        </p>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "18px",
            display: "grid",
            gap: "0.5rem",
            padding: "1rem 1.1rem"
          }}
        >
          <strong>Active environment</strong>
          <span>{activeEnvironment.label}</span>
          <span>{activeEnvironment.url}</span>
        </div>
        <p style={{ color: "rgba(244, 238, 220, 0.78)", margin: 0 }}>
          Next step: connect the native shell to the live dashboard route and add desktop-only capabilities if needed.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

