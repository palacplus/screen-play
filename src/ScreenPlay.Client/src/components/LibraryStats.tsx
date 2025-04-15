interface LibraryStatsProps {
  totalMovies: number;
  activeUsers: number;
  totalHoursWatched: number;
  totalRatings: number;
  topTitles: string[];
}

export default function LibraryStats({
  totalMovies,
  activeUsers,
  totalHoursWatched,
  totalRatings,
  topTitles,
}: LibraryStatsProps) {
  return (
    <div className="shared-container">
      {/* Title Section */}
      <div className="shared-header">
        <h3>Library Overview</h3>
      </div>

      {/* Metrics */}
      <div className="shared-body">
        <p>
          <strong className="stat-value">{totalMovies}</strong> Total Movies
        </p>
        <p>
          <strong className="stat-value">{activeUsers}</strong> Active Users
        </p>
        <p>
          <strong className="stat-value">{totalHoursWatched}</strong> Total Hours Watched
        </p>
        <p>
          <strong className="stat-value">{totalRatings}</strong> Total Ratings
        </p>

        {/* Top Titles */}
        <h3 className="top-titles-header">Popular Titles</h3>
        <ol className="top-titles-list">
          {topTitles.map((title, index) => (
            <li key={index} className="top-title-item">
              {title}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}