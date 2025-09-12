import { useEffect, useState } from "react";
import { QueueItem, QueueResponse } from "@/types/library";
import { getQueue } from "@/services/api/library";
import LoadingOverlay from "./LoadingOverlay";
import "./QueueDisplay.css";
import "./shared.css";

interface QueueDisplayProps {
    refreshInterval?: number; // in milliseconds, default 30 seconds
}

export default function QueueDisplay({ refreshInterval = 30000 }: QueueDisplayProps) {
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchQueue = async () => {
        try {
            const response: QueueResponse = await getQueue();
            setError(null);
            setQueueItems(response.items || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to fetch queue:", err);
            setError("Failed to load queue. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        
        // Set up auto-refresh
        const interval = setInterval(fetchQueue, refreshInterval);
        
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatProgress = (size: number, sizeLeft: number): number => {
        if (size === 0) return 0;
        return Math.round(((size - sizeLeft) / size) * 100);
    };

    const formatEstimatedTime = (estimatedTime: string): string => {
        const date = new Date(estimatedTime);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        
        if (diffMs <= 0) return "Completing soon";
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        } else if (minutes > 0) {
            return `${minutes}m remaining`;
        } else {
            return "< 1m remaining";
        }
    };

    const getStatusIcon = (status: string): string => {
        switch (status.toLowerCase()) {
            case "downloading":
                return "⬇️";
            case "queued":
                return "⏳";
            case "completed":
                return "✅";
            case "paused":
                return "⏸️";
            case "failed":
                return "❌";
            default:
                return "📄";
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case "downloading":
                return "#4caf50";
            case "queued":
                return "#ff9800";
            case "completed":
                return "#2196f3";
            case "paused":
                return "#9e9e9e";
            case "failed":
                return "#f44336";
            default:
                return "#607d8b";
        }
    };

    if (isLoading) {
        return (
            <div className="queue-display">
                <LoadingOverlay isLoading={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="queue-display">
                <div className="queue-header">
                    <h2>Download Queue</h2>
                    <button onClick={fetchQueue} className="refresh-button">
                        🔄 Retry
                    </button>
                </div>
                <div className="error-message">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="queue-display">
            <div className="queue-header">
                <h2>Download Queue</h2>
                <div className="queue-controls">
                    <button onClick={fetchQueue} className="refresh-button">
                        🔄 Refresh
                    </button>
                    {lastUpdated && (
                        <span className="last-updated">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {queueItems.length === 0 ? (
                <div className="empty-queue">
                    <div className="empty-queue-icon">📭</div>
                    <h3>Queue is empty</h3>
                    <p>No movies are currently being downloaded.</p>
                </div>
            ) : (
                <div className="queue-items">
                    {queueItems.map((item, index) => {
                        const progress = formatProgress(item.size, item.sizeleft);
                        const statusColor = getStatusColor(item.status);
                        
                        return (
                            <div key={`${item.movieId}-${index}`} className="queue-item">
                                <div className="queue-item-header">
                                    <div className="movie-info">
                                        <span className="status-icon">
                                            {getStatusIcon(item.status)}
                                        </span>
                                        <h3 className="movie-title">{item.movie.title}</h3>
                                        <span 
                                            className="status-badge" 
                                            style={{ backgroundColor: statusColor }}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="queue-item-details">
                                        <span className="quality-info">
                                            {item.quality.quality.name}
                                        </span>
                                        <span className="size-info">
                                            {formatFileSize(item.size)}
                                        </span>
                                    </div>
                                </div>

                                {item.status.toLowerCase() === "downloading" && (
                                    <div className="progress-section">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="progress-info">
                                            <span>{progress}% complete</span>
                                            <span>{formatFileSize(item.sizeleft)} remaining</span>
                                            <span className="eta">
                                                {formatEstimatedTime(item.estimatedCompletionTime)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="queue-item-footer">
                                    <span className="added-date">
                                        Added: {new Date(item.added).toLocaleDateString()} at{" "}
                                        {new Date(item.added).toLocaleTimeString()}
                                    </span>
                                    <span className="tmdb-id">
                                        TMDB ID: {item.movie.tmdbId}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
