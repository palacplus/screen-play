import "./shared.css";
import "./About.css";

export default function About() {
  return (
    <div className="shared-container about fade-in">
      {/* Title Section */}
      <div className="shared-header">
        <h1>Welcome to ScreenPlay!</h1>
      </div>

      {/* Description */}
      <div className="shared-body">
        <p>
          ScreenPlay is your ultimate movie library management system. Explore our extensive
          collection of movies, track your favorites, and stay updated with the latest trends.
        </p>
        <p>
          Log in to access personalized features, view detailed metrics, and rate your favorite
          titles. Start your journey with ScreenPlay today!
        </p>
        
        <div className="about-features">
          <div className="feature-item">
            <h3>📚 Extensive Library</h3>
            <p>Browse through thousands of movies with detailed information and ratings.</p>
          </div>
          <div className="feature-item">
            <h3>⭐ Personal Ratings</h3>
            <p>Rate your favorite movies and keep track of what you've watched.</p>
          </div>
          <div className="feature-item">
            <h3>🎯 Smart Search</h3>
            <p>Find exactly what you're looking for with our powerful search features.</p>
          </div>
        </div>
      </div>
    </div>
  );
}