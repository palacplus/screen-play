interface LibraryMetricsProps {
  totalMovies: number;
  activeUsers: number;
  totalHoursWatched: number;
  totalRatings: number;
  topTitles: string[];
}

export default function LibraryMetrics({
  totalMovies,
  activeUsers,
  totalHoursWatched,
  totalRatings,
  topTitles,
}: LibraryMetricsProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: "1rm",
        backgroundColor: "#fff", // Match the LoginPanel background
        borderRadius: "15px", // Match the LoginPanel border radius
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.35)", // Match the LoginPanel shadow
      }}
    >
      {/* Title Section with Gradient Background */}
      <div
        style={{
          background: "linear-gradient(to right, #344157, #1e293b)", // Match the gradient in the toggle class
          borderRadius: "15px 15px 0 0", // Rounded corners for the top
          padding: "1rem",
          textAlign: "center",
          color: "#fff", // White text for contrast
        }}
      >
        <h3 style={{ margin: 0 }}>Library Overview</h3>
      </div>

      {/* Metrics */}
      <div style={{ padding: "1rem" }}>
        <p>
          <strong style={{ fontSize: "1.5rem", color: "#007bff" }}>{totalMovies}</strong>{" "}
          Total Movies
        </p>
        <p>
          <strong style={{ fontSize: "1.5rem", color: "#007bff" }}>{activeUsers}</strong>{" "}
          Active Users
        </p>
        <p>
          <strong style={{ fontSize: "1.5rem", color: "#007bff" }}>{totalHoursWatched}</strong>{" "}
          Total Hours Watched
        </p>
        <p>
          <strong style={{ fontSize: "1.5rem", color: "#007bff" }}>{totalRatings}</strong>{" "}
          Total Ratings
        </p>

        {/* Top Titles */}
        <h3 style={{ marginTop: "1rem", color: "#495057" }}>Top 3 Titles</h3>
        <ol>
          {topTitles.map((title, index) => (
            <li key={index} style={{ color: "#007bff", fontWeight: "bold" }}>
              {title}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}