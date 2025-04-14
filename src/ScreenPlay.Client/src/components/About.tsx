export default function About() {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "0.1rem",
        backgroundColor: "#fff", // Match the LibraryMetrics background
        borderRadius: "15px", // Match the LibraryMetrics border radius
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)", // Match the LibraryMetrics shadow
      }}
    >
      {/* Title Section with Gradient Background */}
      <div
        style={{
          background: "linear-gradient(to right, #344157, #1e293b)", // Match the LibraryMetrics gradient
          borderRadius: "15px 15px 0 0", // Rounded corners for the top
          padding: "1rem",
          color: "#fff", // White text for contrast
        }}
      >
        <h1 style={{ margin: 0 }}>Welcome!</h1>
      </div>

      {/* Description */}
      <p style={{ fontSize: "1rem", color: "#495057", lineHeight: "1.5", padding: "1rem" }}>
        ScreenPlay is your ultimate movie library management system. Explore our extensive
        collection of movies, track your favorites, and stay updated with the latest trends.
        Log in to access personalized features, view detailed metrics, and rate your favorite
        titles. Start your journey with ScreenPlay today!
      </p>
    </div>
  );
}