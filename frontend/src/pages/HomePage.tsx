import About from "../components/About";
import LoginPanel from "../components/LoginPanel";
import LibraryStats from "../components/LibraryStats";
import "./HomePage.css";
import GitHubLink from "../components/GitHubLink";

export default function HomePage() {
  return (
    <div className="page">
      <div className="main-content">
        <div className="left-side">
          <About />
          <LibraryStats />
        </div>
        <div className="right-side">
          <LoginPanel />
        </div>
      </div>
      <GitHubLink />
    </div>
  );
}
