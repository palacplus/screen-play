import { getStats } from "../services/api/library";
import { StatsModel } from "@/types/library";
import { useEffect, useState } from "react";

export default function LibraryStats() {
  const [stats, setStats] = useState<StatsModel>();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getStats()
        setStats(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="shared-container">
      {/* Title Section */}
      <div className="shared-header">
        <h3>Library Overview</h3>
      </div>

      {/* Metrics */}
      <div className="shared-body">
        <p>
          <strong className="stat-value">{stats?.movieCount}</strong> Total Movies
        </p>
        <p>
          <strong className="stat-value">{stats?.userCount}</strong> Active Users
        </p>
        <p>
          <strong className="stat-value">{stats?.ratingsCount}</strong> Total Ratings
        </p>
      </div>
    </div>
  );
}