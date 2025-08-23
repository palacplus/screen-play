import { MoviePartial } from "@/types/library";
import { useState } from "react";
import "./Poster.css";

interface PosterProps {
  movie: MoviePartial;
}

export default function Poster({ movie }: PosterProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const isRecentlyAdded = (() => {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    return movie.addedDate >= twoWeeksAgo;
  })();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="poster-container">
      {isRecentlyAdded && <div className="poster-banner">Recently Added</div>}
      <img
        src={movie.poster}
        alt={movie.title}
        className={`poster-image ${imageLoaded ? 'loaded' : ''}`}
        onLoad={handleImageLoad}
      />
    </div>
  );
}