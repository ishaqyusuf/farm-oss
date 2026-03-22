export default function DashboardHomePage() {
  return (
    <main
      style={{
        display: "grid",
        gap: "1.5rem",
        margin: "0 auto",
        maxWidth: "960px",
        padding: "4rem 1.25rem"
      }}
    >
      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "24px",
          padding: "2rem"
        }}
      >
        <p style={{ color: "var(--accent)", fontSize: "0.85rem", letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
          Dashboard
        </p>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.05, margin: "0.75rem 0 1rem" }}>
          Farm operations, tracked simply.
        </h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, margin: 0, maxWidth: "42rem" }}>
          The dashboard now follows a `src/app` structure to align with Expo and web, ready for shared domain and data hooks next.
        </p>
      </section>
    </main>
  );
}

