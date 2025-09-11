import { useEffect, useState } from "react";
import { convertMovieToPartial, QueueItem, QueueResponse } from "../types/library";
import { getQueue } from "../services/api/library";
import LoadingOverlay from "./LoadingOverlay";
import "./QueuePanel.css";
import "./shared.css";

interface QueuePanelProps {
    refreshInterval?: number; // in milliseconds, default 30 seconds
}

export default function QueuePanel({ refreshInterval = 30000 }: QueuePanelProps) {
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23374151'/%3E%3Ctext x='150' y='200' font-family='Arial, sans-serif' font-size='14' fill='%23cbd5e1' text-anchor='middle'%3ENo Image%3C/text%3E%3Ctext x='150' y='220' font-family='Arial, sans-serif' font-size='14' fill='%23cbd5e1' text-anchor='middle'%3EAvailable%3C/text%3E%3Cpath d='M120 240 L180 240 L150 280 Z' fill='%23cbd5e1'/%3E%3C/svg%3E";

    const fetchQueue = async () => {
        try {
            setError(null);
            const response: QueueResponse = await getQueue();
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
            <div className="queue-panel">
                <LoadingOverlay isLoading={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="queue-panel">
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
        <div className="queue-panel">
            <div className="queue-header">
                <div className="queue-title">
                    <h2>Download Queue</h2>
                    <span className="queue-count-badge" data-testid="queue-count">{queueItems.length}</span>
                </div>
                <div className="queue-controls">
                    <button onClick={fetchQueue} className="refresh-button">
                        Refresh
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
                    {queueItems
                        .sort((a, b) => new Date(b.added).getTime() - new Date(a.added).getTime())
                        .map((item, index) => {
                        const progress = formatProgress(item.size, item.sizeleft);
                        const statusColor = getStatusColor(item.status);
                        const movieDetails = convertMovieToPartial(item.movie);
                        
                        return (
                            <div key={`${item.movieId}-${index}`} className="queue-item">
                                <div className="queue-item-main">
                                    <div className="movie-poster">
                                        <img 
                                            src={movieDetails.poster} 
                                            alt={`${movieDetails.title} poster`}
                                            className="poster-image"
                                            onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src !== placeholderImage) {
                                                target.src = placeholderImage;
                                            }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="movie-content">
                                        <div className="movie-header">
                                            <div className="title-section">
                                                <h3 className="movie-title">{movieDetails.title}</h3>
                                                <div className="movie-meta">
                                                    {movieDetails.year && (
                                                        <span className="movie-year">{movieDetails.year}</span>
                                                    )}
                                                    {movieDetails.runtime && (
                                                        <span className="movie-runtime">{movieDetails.runtime}</span>
                                                    )}
                                                    {movieDetails.genre && (
                                                        <span className="movie-genres">{movieDetails.genre}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="queue-status">
                                                <span 
                                                    className="status-badge" 
                                                    style={{ backgroundColor: statusColor }}
                                                >
                                                    {item.status}
                                                </span>
                                                <div className="queue-details">
                                                    <span className="quality-info">{item.quality.quality.name}</span>
                                                    <span className="size-info">{formatFileSize(item.size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
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
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
