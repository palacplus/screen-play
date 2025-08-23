import { MoviePartial } from "@/types/library";
import { useState } from "react";
import "./Popup.css";
import "./shared.css";

interface PopupProps {
  movie: MoviePartial;
  onClose: () => void;
}

export default function Popup({ movie, onClose }: PopupProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // No scroll tracking needed - using pure CSS positioning

  const formatReleaseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      const day = date.getDate();
      let dayWithSuffix;
      if (day >= 11 && day <= 13) {
        dayWithSuffix = day + 'th';
      } else {
        switch (day % 10) {
          case 1: dayWithSuffix = day + 'st'; break;
          case 2: dayWithSuffix = day + 'nd'; break;
          case 3: dayWithSuffix = day + 'rd'; break;
          default: dayWithSuffix = day + 'th'; break;
        }
      }
      return formattedDate.replace(day.toString(), dayWithSuffix);
    } catch (error) {
      return dateString;
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleReportSubmit = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setIsReporting(false);
      setReportText("");
    }, 2000);
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("popup-backdrop")) {
      handleClose();
    }
  };

  return (
    <div 
      className="popup-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className="popup-content animate-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={handleClose} aria-label="Close">
          &times;
        </button>
        {!isReporting ? (
          <>
            <button className="popup-report-btn" onClick={() => setIsReporting(true)}>
              Report an Issue
            </button>
            <div className="popup-header">
              <img className="popup-image" src={movie.poster} alt={movie.title} />
              <div className="popup-header-details">
                <h2>{movie.title}</h2>
                <p className="popup-genre">{movie.genre}</p>
                <p className="popup-release-date">Released: {movie.released ? formatReleaseDate(movie.released) : 'NA'}</p>
                <p className="popup-runtime">Runtime: {movie.runtime}</p>
                <div className="popup-rated">
                  <span className={`rated-icon rated-${movie.rated?.toLowerCase()}`}>
                    {movie.rated}
                  </span>
                </div>
              </div>
            </div>
            <div className="popup-body">
              <div className="popup-description-section">
                <h3>Description</h3>
                <p className="popup-description">{movie.plot}</p>
              </div>
              <div className="popup-metadata">
                <p>
                  <strong>Director:</strong> {movie.director}
                </p>
                <p>
                  <strong>Writer:</strong> {movie.writer}
                </p>
                <p>
                  <strong>Actors:</strong> {movie.actors}
                </p>
                <p>
                  <strong>Language:</strong> {movie.language}
                </p>
                <p>
                  <strong>Country:</strong> {movie.country}
                </p>
                <p>
                  <strong>Awards:</strong> {movie.awards}
                </p>
              </div>
            </div>
            <div className="popup-ratings">
              <div className="imdb-rating">
                <img src="/assets/imdb-logo.png" alt="IMDb" className="imdb-logo" />
                <span>{movie.imdbRating} / 10</span>
              </div>
              <div className="box-office">
                <strong>Box Office:</strong>{" "}
                <span className="box-office-value">{movie.boxOffice}</span>
              </div>
            </div>
            <div className="popup-rating">
              <h3>Rate this movie:</h3>
              <div className="popup-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`popup-star ${rating && star <= rating ? "selected" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rating && <p className="popup-rating-value">You rated this {rating} / 5</p>}
            </div>
          </>
        ) : showConfirmation ? (
          <div className="popup-confirmation">
            <p>Thank you for your report! We’ll review it shortly.</p>
          </div>
        ) : (
          <div className="popup-report-form">
            <h3>Report an Issue</h3>
            <textarea
              className="popup-report-textarea"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue..."
            ></textarea>
            <button
              className="popup-submit-btn"
              onClick={handleReportSubmit}
              disabled={!reportText.trim()}
            >
              Submit
            </button>
            <button className="popup-cancel-btn" onClick={() => setIsReporting(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}