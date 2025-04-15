import { memo, useMemo, useRef, useEffect, useState } from "react";
import Popup from "./Popup"; // Import the Popup component
import { Movie } from "@/types/library";
import Poster from "./Poster";
import "./LibraryShelf.css";

interface LibraryShelfProps {
  posters: Movie[];
}

export default function LibraryShelf({ posters }: LibraryShelfProps) {
  const rowRefs = useRef<{ [genre: string]: HTMLDivElement | null }>({});
  const [overflowStates, setOverflowStates] = useState<{
    [genre: string]: { left: boolean; right: boolean };
  }>({});
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null); // State to track the selected movie

  // Group posters by the first genre
  const groupByGenre = useMemo(() => {
    const genreMap: { [genre: string]: Movie[] } = {};
    posters.forEach((movie) => {
      const firstGenre = movie.genre?.split(", ")[0]; // Use only the first genre
      if (firstGenre) {
        if (!genreMap[firstGenre]) {
          genreMap[firstGenre] = [];
        }
        genreMap[firstGenre].push(movie);
      }
    });
    return genreMap;
  }, [posters]);

  // Create refs for each genre row
  Object.keys(groupByGenre).forEach((genre) => {
    if (!rowRefs.current[genre]) {
      rowRefs.current[genre] = null; // Initialize ref for each genre
    }
  });

  // Check for overflow in each row
  useEffect(() => {
    const updateOverflowStates = () => {
      const newOverflowStates: { [genre: string]: { left: boolean; right: boolean } } = {};
      Object.keys(groupByGenre).forEach((genre) => {
        const rowRef = rowRefs.current[genre];
        if (rowRef) {
          const { scrollLeft, scrollWidth, clientWidth } = rowRef;

          // Debugging: Log scrollWidth and clientWidth
          console.log(`Genre: ${genre}, scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}`);

          newOverflowStates[genre] = {
            left: scrollLeft > 0, // Overflow on the left
            right: scrollLeft + clientWidth < scrollWidth, // Overflow on the right
          };
        }
      });
      console.log("Updated overflow states:", newOverflowStates); // Debugging
      setOverflowStates(newOverflowStates);
    };

    updateOverflowStates();

    window.addEventListener("resize", updateOverflowStates);
    return () => {
      window.removeEventListener("resize", updateOverflowStates);
    };
  }, [groupByGenre]);

  // Scroll row functionality
  const scrollRow = (genre: string, direction: "left" | "right") => {
    const rowRef = rowRefs.current[genre];
    if (rowRef) {
      const scrollAmount = direction === "left" ? -175 : 175; // Adjust scroll amount as needed
      rowRef.scrollBy({ left: scrollAmount, behavior: "smooth" });

      // Update overflow states after scrolling
      setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef;
        setOverflowStates((prev) => ({
          ...prev,
          [genre]: {
            left: scrollLeft > 0,
            right: scrollLeft + clientWidth < scrollWidth,
          },
        }));
      }, 300); // Delay to allow smooth scrolling to complete
    }
  };

  return (
    <div className="library-shelf">
      {Object.entries(groupByGenre).map(([genre, movies], genreIndex) => (
        <div key={genreIndex} className="library-shelf-row-container">
          {/* Genre Label */}
          <h3 className="genre-label">{genre}</h3>
          <div className="scroll-buttons">
            {overflowStates[genre]?.left && (
              <button
                className="scroll-button left"
                onClick={() => scrollRow(genre, "left")}
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
                  onClick={() => setSelectedMovie(movie)} // Open popup on click
                >
                  <MemoizedPoster movie={movie} />
                </div>
              ))}
            </div>
            {overflowStates[genre]?.right && (
              <button
                className="scroll-button right"
                onClick={() => scrollRow(genre, "right")}
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Popup for Selected Movie */}
      {selectedMovie && (
        <Popup
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)} // Close popup
        />
      )}

      {posters.length === 0 && (
        <p className="empty-library-message">Oops! This library is empty.</p>
      )}
    </div>
  );
}

const MemoizedPoster = memo(Poster);