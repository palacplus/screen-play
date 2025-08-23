import { getStats } from "../services/api/library";
import { StatsModel } from "@/types/library";
import { useEffect, useState } from "react";
import "./shared.css";
import "./LibraryStats.css";

export default function LibraryStats() {
  const [stats, setStats] = useState<StatsModel>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await getStats();
        setStats(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="shared-container library-stats fade-in">
        <div className="shared-header">
          <h1>Library Overview</h1>
        </div>
        <div className="shared-body">
          <div className="stats-loading">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-container library-stats fade-in">
      {/* Title Section */}
      <div className="shared-header">
        <h1>Library Overview</h1>
      </div>

      {/* Statistics Grid */}
      <div className="shared-body">
        <p>
          Here's a quick overview of your movie library statistics and community activity.
        </p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats?.movieCount || 0}</span>
            <span className="stat-label">Total Movies</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.userCount || 0}</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.ratingsCount || 0}</span>
            <span className="stat-label">Total Ratings</span>
          </div>
        </div>
      </div>
    </div>
  );
}