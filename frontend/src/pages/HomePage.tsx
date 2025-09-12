import About from "../components/About";
import LoginPanel from "../components/LoginPanel";
import QueuePanel from "../components/QueuePanel";
import LibraryStats from "../components/LibraryStats";
import { useAuth } from "../components/AuthProvider";
import "./HomePage.css";
import GitHubLink from "../components/GitHubLink";

export default function HomePage() {
  const auth = useAuth();
  const isAuthenticated = auth.token && auth.currentUser;

  return (
    <div className="page">
      <div className="main-content">
        <div className="left-side">
          <LibraryStats />
        </div>
        <div className="right-side">
          {isAuthenticated ? (
            <QueuePanel refreshInterval={10000} />
          ) : (
            <LoginPanel />
          )}
          <About />
        </div>
      </div>
      <GitHubLink />
    </div>
  );
}
