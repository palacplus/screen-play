import { useState } from "react";

interface PopupProps {
  imageUrl: string;
  title: string;
  description: string;
  onClose: () => void;
}

export default function Popup({ imageUrl, title, description, onClose }: PopupProps) {
  const [rating, setRating] = useState(0);

  const handleRating = (value: number) => {
    setRating(value);
  };

  return (
    <>
      {/* Background Overlay */}
      <div
        onClick={onClose} // Close the popup when clicking outside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
          zIndex: 999,
        }}
      ></div>

      {/* Popup Content */}
      <div
        style={{
          position: "fixed", // Use fixed positioning for centering
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)", // Center the popup
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          width: "500px",
          display: "flex",
          gap: "1rem",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        {/* Poster Image */}
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "150px",
            height: "225px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />

        {/* Title, Description, and Rating */}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 1rem 0" }}>{title}</h2>
          <p style={{ marginBottom: "1rem" }}>{description}</p>

          {/* Interactive 5-Star Rating */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRating(star)}
                style={{
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: star <= rating ? "#FFD700" : "#ccc", // Highlight selected stars
                }}
              >
                ★
              </span>
            ))}
          </div>
          <p style={{ marginTop: "0.5rem" }}>Your Rating: {rating} / 5</p>
        </div>
      </div>
    </>
  );
}