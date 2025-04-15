import About from "../components/About";
import LoginPanel from "../components/LoginPanel";
import LibraryStats from "../components/LibraryStats";
import "./HomePage.css";
import GitHubLink from "../components/GitHubLink";

export default function HomePage() {
  const libraryMetrics = {
    totalMovies: 10,
    activeUsers: 1200,
    totalHoursWatched: 4500,
    totalRatings: 3200,
    topTitles: ["Inception", "Back To The Future", "Jurassic Park"],
  };

  return (
    <div className="page">
      <div className="main-content">
        <div className="left-side">
          <About />
          <LibraryStats {...libraryMetrics} />
        </div>
        <div className="right-side">
          <LoginPanel />
        </div>
      </div>
      <GitHubLink />
    </div>
  );
}
