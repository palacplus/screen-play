import { MoviePartial } from "@/types/library";
import "./Poster.css";

interface PosterProps {
  movie: MoviePartial;
}

export default function Poster({ movie }: PosterProps) {
  const isRecentlyAdded = (() => {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    return movie.addedDate >= twoWeeksAgo;
  })();

  return (
    <div className="poster-container">
      {isRecentlyAdded && <div className="poster-banner">Recently Added</div>}
      <img
        src={movie.poster}
        alt={movie.title}
        className="poster-image"
      />
    </div>
  );
}