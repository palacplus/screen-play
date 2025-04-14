import About from "../components/About";
import LoginPanel from "./LoginPanel";
import LibraryMetrics from "../components/LibraryMetrics";

export default function HomePage() {
  const posters = [
    {
      imageUrl:
        "https://www.movieposters.com/cdn/shop/files/backtofuture.mpw_480x.progressive.jpg?v=1708444122",
      title: "Back To The Future",
      description: "A time-traveling adventure.",
      addedDate: "2025-04-01",
    },
    {
      imageUrl:
        "https://www.movieposters.com/cdn/shop/files/jurassicpark.mpw_480x.progressive.jpg?v=1708444122",
      title: "Jurassic Park",
      description: "Dinosaurs run wild.",
      addedDate: "2025-03-15",
    },
    {
      imageUrl:
        "https://www.movieposters.com/cdn/shop/files/inception.mpw.123395_9e0000d1-bc7f-400a-b488-15fa9e60a10c_480x.progressive.jpg?v=1708527589",
      title: "Inception",
      description: "A mind-bending thriller.",
      addedDate: "2025-04-10",
    },
    {
      imageUrl:
        "https://www.movieposters.com/cdn/shop/files/Matrix.mpw.102176_bb2f6cc5-4a16-4512-881b-f855ead3c8ec_480x.progressive.jpg?v=1708703624",
      title: "The Matrix",
      description: "A sci-fi classic.",
      addedDate: "2025-03-01",
    },
  ];

  const libraryMetrics = {
    totalMovies: posters.length,
    activeUsers: 1200,
    totalHoursWatched: 4500,
    totalRatings: 3200,
    topTitles: ["Inception", "Back To The Future", "Jurassic Park"],
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        width: "100%",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2rem",
          width: "100%",
        }}
      >
        {/* Left Side: About and Library Metrics */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
          <About />
          <LibraryMetrics {...libraryMetrics} />
        </div>

        {/* Right Side: Login Panel */}
        <div style={{ flex: 1 }}>
          <LoginPanel />
        </div>
      </div>

      {/* GitHub Icon Link */}
      <div
        style={{
          textAlign: "center",
          marginTop: "5rem",
        }}
      >
        <a
          href="https://github.com/mike-palacio-nice/screen-play"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "#1e293b",
            fontSize: "1.5rem",
          }}
        >
          <i className="fab fa-github" style={{ marginRight: "0.5rem" }}></i>
          GitHub
        </a>
      </div>
    </div>
  );
}
