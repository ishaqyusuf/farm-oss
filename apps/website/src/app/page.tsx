export default function WebsiteHomePage() {
  return (
    <main
      style={{
        display: "grid",
        gap: "2rem",
        margin: "0 auto",
        maxWidth: "1100px",
        padding: "4rem 1.25rem 5rem"
      }}
    >
      <section style={{ display: "grid", gap: "1rem", maxWidth: "48rem" }}>
        <p style={{ color: "var(--accent)", letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
          Farm Record And Profit Tracker
        </p>
        <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 0.95, margin: 0 }}>
          Replace notebooks with a daily farm operating system.
        </h1>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.8, margin: 0 }}>
          The web app now follows the same `src/` convention as dashboard and Expo, keeping all frontends aligned as the product grows.
        </p>
      </section>
    </main>
  );
}

