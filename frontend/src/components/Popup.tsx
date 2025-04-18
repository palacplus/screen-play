import { Movie } from "@/types/library";
import { useState } from "react";
import "./Popup.css";

interface PopupProps {
  movie: Movie;
  onClose: () => void;
}

export default function Popup({ movie, onClose }: PopupProps) {
  const [rating, setRating] = useState<number | null>(null); // State for user rating
  const [isReporting, setIsReporting] = useState(false); // State for toggling the report form
  const [reportText, setReportText] = useState(""); // State for report input
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation message

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleReportSubmit = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setIsReporting(false);
      setReportText("");
    }, 2000); // Show confirmation for 2 seconds
  };

  return (
    <div
      className="popup-backdrop"
      onClick={onClose} // Close popup when clicking outside
    >
      <div
        className="popup-content animate-popup"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button className="popup-close-btn" onClick={onClose}>
          &times;
        </button>
        {!isReporting ? (
          <>
            <button
              className="popup-report-btn"
              onClick={() => setIsReporting(true)}
            >
              Report an Issue
            </button>
            <div className="popup-header">
              <img className="popup-image" src={movie.poster} alt={movie.title} />
              <div className="popup-header-details">
                <h2>{movie.title}</h2>
                <p className="popup-genre">{movie.genre}</p>
                <p className="popup-release-date">Released: {movie.releaseDate}</p>
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
                <p className="popup-description">{movie.description}</p>
              </div>
              <div className="popup-metadata">
                <p>
                  <strong>Director:</strong> {movie.director}
                </p>
                <p>
                  <strong>Writer:</strong> {movie.writer}
                </p>
                <p>
                  <strong>Actors:</strong> {movie.actors?.join(", ")}
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
                <img
                  src="/assets/imdb-logo.png"
                  alt="IMDb"
                  className="imdb-logo"
                />
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
            <button
              className="popup-cancel-btn"
              onClick={() => setIsReporting(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}