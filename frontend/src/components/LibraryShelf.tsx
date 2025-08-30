import { memo, useMemo, useRef, useEffect, useState } from "react";
import { Movie, MoviePartial } from "@/types/library";
import Poster from "./Poster";
import "./LibraryShelf.css";
import "./shared.css";

interface LibraryShelfProps {
  posters: MoviePartial[];
  isLoading: boolean;
  onMovieSelect: (movie: MoviePartial) => void;
}

export default function LibraryShelf({ posters, isLoading, onMovieSelect }: LibraryShelfProps) {
  const rowRefs = useRef<{ [genre: string]: HTMLDivElement | null }>({});
  const [overflowStates, setOverflowStates] = useState<{
    [genre: string]: { left: boolean; right: boolean };
  }>({});

  const groupByGenre = useMemo(() => {
    const genreMap: { [genre: string]: MoviePartial[] } = {};
    posters.forEach((movie) => {
      const firstGenre = movie.genre?.split(", ")[0];
      if (firstGenre) {
        if (!genreMap[firstGenre]) {
          genreMap[firstGenre] = [];
        }
        genreMap[firstGenre].push(movie);
      }
    });

    return Object.entries(genreMap)
      .sort(([, moviesA], [, moviesB]) => moviesB.length - moviesA.length)
      .reduce((sortedMap, [genre, movies]) => {
        sortedMap[genre] = movies;
        return sortedMap;
      }, {} as { [genre: string]: MoviePartial[] });
  }, [posters]);

  useEffect(() => {
    Object.keys(groupByGenre).forEach((genre) => {
      if (!rowRefs.current[genre]) {
        rowRefs.current[genre] = null;
      }
    });
  }, [groupByGenre]);

  useEffect(() => {
    const updateOverflowStates = () => {
      const newOverflowStates: { [genre: string]: { left: boolean; right: boolean } } = {};
      Object.keys(groupByGenre).forEach((genre) => {
        const rowRef = rowRefs.current[genre];
        if (rowRef) {
          const { scrollLeft, scrollWidth, clientWidth } = rowRef;
          newOverflowStates[genre] = {
            left: scrollLeft > 0,
            right: scrollLeft + clientWidth < scrollWidth,
          };
        }
      });
      setOverflowStates(newOverflowStates);
    };

    updateOverflowStates();

    window.addEventListener("resize", updateOverflowStates);
    return () => {
      window.removeEventListener("resize", updateOverflowStates);
    };
  }, [groupByGenre]);

  const scrollRow = (genre: string, direction: "left" | "right") => {
    const rowRef = rowRefs.current[genre];
    if (rowRef) {
      const scrollAmount = direction === "left" ? -500 : 500;
      rowRef.scrollBy({ left: scrollAmount, behavior: "smooth" });

      setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef;
        setOverflowStates((prev) => ({
          ...prev,
          [genre]: {
            left: scrollLeft > 0,
            right: scrollLeft + clientWidth < scrollWidth,
          },
        }));
      }, 300);
    }
  };

  return (
    <div className={`library-shelf ${isLoading ? 'loading' : ''}`}>
      {Object.entries(groupByGenre).map(([genre, movies], genreIndex) => (
        <div key={genreIndex} className="library-shelf-row-container fade-in">
          <h3 className="genre-label">{genre}</h3>
          <div className="scroll-buttons">
            {overflowStates[genre]?.left && (
              <button
                className="scroll-button left"
                onClick={() => scrollRow(genre, "left")}
                aria-label={`Scroll ${genre} left`}
              >
                &#8249;
              </button>
            )}
            <div
              className="library-shelf-row"
              ref={(el) => {
                rowRefs.current[genre] = el;
              }}
            >
              {movies.map((movie, index) => (
                <div
                  key={index}
                  className="library-shelf-poster"
                  onClick={() => onMovieSelect(movie)}
                >
                  <MemoizedPoster movie={movie} />
                </div>
              ))}
            </div>
            {overflowStates[genre]?.right && (
              <button
                className="scroll-button right"
                onClick={() => scrollRow(genre, "right")}
                aria-label={`Scroll ${genre} right`}
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      ))}

      {posters.length === 0 && !isLoading && (
        <div className="shared-empty">
          <h3>No movies found</h3>
          <p>Try adjusting your search criteria or check back later for new additions.</p>
        </div>
      )}
    </div>
  );
}

const MemoizedPoster = memo(Poster);