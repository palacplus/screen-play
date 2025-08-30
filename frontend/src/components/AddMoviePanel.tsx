import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AddMoviePanel.css";
import "./shared.css";
import { MoviePartial } from "../types/library";
import LoadingOverlay from "./LoadingOverlay";
import { addNewMovie } from "../services/api/library";

interface AddMoviePanelProps {
  onAddMovie: (movie: MoviePartial) => void;
}

export default function AddMoviePanel({ onAddMovie }: AddMoviePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [movie, setMovie] = useState<MoviePartial | null>(null);
  const [error, setError] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a movie name.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("https://www.omdbapi.com/", {
        params: {
          apikey: "e11f806f",
          t: searchQuery,
        },
      });

      if (response.data.Response === "True" && response.data.Type === "movie") {
        setMovie({
          title: response.data.Title,
          year: response.data.Year,
          rated: response.data.Rated,
          released: response.data.Released,
          runtime: response.data.Runtime,
          genre: response.data.Genre,
          director: response.data.Director,
          writer: response.data.Writer,
          actors: response.data.Actors,
          plot: response.data.Plot,
          language: response.data.Language,
          country: response.data.Country,
          awards: response.data.Awards,
          poster: response.data.Poster,
          ratings: response.data.Ratings,
          metascore: response.data.Metascore,
          imdbRating: response.data.imdbRating,
          imdbVotes: response.data.imdbVotes,
          imdbID: response.data.imdbID,
          boxOffice: response.data.BoxOffice,
          addedDate: new Date(),
        });
        setError("");
        setExpanded(true);
      } else {
        setError("Movie not found. Please try again.");
        setMovie(null);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while searching. Please try again.");
      setMovie(null);
    }
    setLoading(false);
  };

  const handleAddMovie = async () => {
    if (movie) {
      setLoading(true);
      try {
        await addNewMovie(movie);
        onAddMovie(movie);
        setError("");
      } catch (err: Error | any) {
        console.error(err);
        setError("An error occurred while adding the movie. Please try again.");
      } finally {
        setLoading(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setMovie(null);
    setSearchQuery("");
    setError(null);
    setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`add-movie-panel ${expanded ? "expanded" : ""} ${loading ? "loading" : ""}`}>
      <LoadingOverlay isLoading={loading} />
      <h3>Add a Movie</h3>
      <div className="new-search-container">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {movie && (
        <div className="movie-details">
          <img src={movie.poster} alt={movie.title} className="movie-poster" />
          <div className="movie-info">
            <h4>
              {movie.title} ({movie.year})
            </h4>
            <div className="button-container">
              <button onClick={handleAddMovie} className="add-button" disabled={loading}>
                {loading ? "Adding..." : "Add to Library"}
              </button>
              <button onClick={resetForm} className="cancel-button" disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}