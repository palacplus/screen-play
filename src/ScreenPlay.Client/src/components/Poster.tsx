import { useState } from "react";
import Popup from "./Popup";
import { Movie } from "@/types/library";

interface PosterProps {
  movie: Movie;
}

export default function Poster({ movie }: PosterProps) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  // Calculate if the poster was added within the last 2 weeks
  const isRecentlyAdded = (() => {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    return movie.addedDate >= twoWeeksAgo;
  })();

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Banner (only show if recently added) */}
      {isRecentlyAdded && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "rgba(255, 165, 0, 0.8)", // Semi-transparent yellowish-orange
            color: "#0056b3", // Darker shade of blue
            textAlign: "center",
            fontWeight: "bold",
            padding: "0.3rem 0",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            zIndex: 1,
          }}
        >
          Recently Added
        </div>
      )}

      {/* Movie Cover Image */}
      <img
        src={movie.poster}
        alt={movie.title}
        style={{
          width: "200px",
          height: "300px",
          cursor: "pointer",
          borderRadius: "8px",
          border: "3px solid #007bff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
        onClick={togglePopup}
      />

      {/* Popup */}
      {isPopupVisible && (
        <Popup
          imageUrl={movie.poster}
          title={movie.title}
          description={movie.description}
          onClose={togglePopup}
        />
      )}
    </div>
  );
}