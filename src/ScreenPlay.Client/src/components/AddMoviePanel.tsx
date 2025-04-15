import { useState } from "react";
import axios from "axios";
import "./AddMoviePanel.css";
import { Movie } from "../types/library";
import LoadingOverlay from "./LoadingOverlay";

interface AddMoviePanelProps {
  onAddMovie: (movie: Movie) => void;
}

export default function AddMoviePanel({ onAddMovie }: AddMoviePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a movie name.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("https://www.omdbapi.com/", {
        params: {
          apikey: process.env.REACT_APP_OMDB_API_KEY,
          t: searchQuery,
        },
      });

      if (response.data.Response === "True" && response.data.Type === "movie") {
        setMovie({
          title: response.data.Title,
          year: response.data.Year,
          rated: response.data.Rated,
          releaseDate: response.data.Released,
          runtime: response.data.Runtime,
          genre: response.data.Genre,
          director: response.data.Director,
          writer: response.data.Writer,
          actors: response.data.Actors.split(","),
          description: response.data.Plot,
          language: response.data.Language,
          country: response.data.Country,
          awards: response.data.Awards,
          poster: response.data.Poster,
          ratings: response.data.Ratings,
          metascore: Number(response.data.Metascore),
          imdbRating: Number(response.data.imdbRating),
          imdbVotes: Number(response.data.imdbVotes.split(",").join("")),
          imdbID: response.data.imdbID,
          boxOffice: response.data.boxOffice,
          addedDate: new Date(),
        });
        setError("");
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

  const handleAddMovie = () => {
    if (movie) {
      onAddMovie(movie);
      resetForm();
    }
  };

  const resetForm = () => {
    setMovie(null);
    setSearchQuery("");
    setError(null);
  };

  return (
    <div className="shared-container add-movie-panel">
    <LoadingOverlay isLoading={loading} />
      <div className="shared-header">
        <h3>Add a Movie</h3>
      </div>
      <div className="shared-body new-search-container">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
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
            <button onClick={handleAddMovie} className="add-button">
              Add to Library
            </button>
            <button onClick={resetForm} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}