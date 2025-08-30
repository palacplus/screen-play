import "./AppInfo.css";

interface AppInfoProps {
  className?: string;
}

export default function AppInfo({ className = "" }: AppInfoProps) {
  const version = process.env.REACT_APP_VERSION || "0.1.0";
  const buildNumber = process.env.REACT_APP_BUILD_NUMBER || "dev";
  const commitHash = process.env.REACT_APP_COMMIT_HASH || "unknown";
  const buildDate = process.env.REACT_APP_BUILD_DATE || new Date().toISOString().split('T')[0];

  return (
    <div className={`app-info ${className}`}>
      <div className="app-info-content">
        <span className="app-info-item">
          <span className="app-info-label">v</span>
          <span className="app-info-value">{version}</span>
        </span>
        <span className="app-info-separator">•</span>
        <span className="app-info-item">
          <span className="app-info-label">Build</span>
          <span className="app-info-value">{buildNumber}</span>
        </span>
        <span className="app-info-separator">•</span>
        <span className="app-info-item">
          <span className="app-info-label">Commit</span>
          <span className="app-info-value">{commitHash.substring(0, 7)}</span>
        </span>
        <span className="app-info-separator">•</span>
        <span className="app-info-item">
          <span className="app-info-value">{buildDate}</span>
        </span>
      </div>
    </div>
  );
}
