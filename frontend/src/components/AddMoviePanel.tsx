import { useState, useEffect } from "react";
import axios from "axios";
import "./AddMoviePanel.css";
import "./shared.css";
import { MoviePartial, MovieSearchResult } from "../types/library";
import { usePersistedState } from "../hooks/usePersistedState";
import { addNewMovie } from "../services/api/library";
interface AddMoviePanelProps {
  onAddMovie: (movie: MoviePartial) => void;
}

export default function AddMoviePanel({ onAddMovie }: AddMoviePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [posters] = usePersistedState<MoviePartial[]>("posters", []);
  const [error, setError] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23374151'/%3E%3Ctext x='150' y='200' font-family='Arial, sans-serif' font-size='14' fill='%23cbd5e1' text-anchor='middle'%3ENo Image%3C/text%3E%3Ctext x='150' y='220' font-family='Arial, sans-serif' font-size='14' fill='%23cbd5e1' text-anchor='middle'%3EAvailable%3C/text%3E%3Cpath d='M120 240 L180 240 L150 280 Z' fill='%23cbd5e1'/%3E%3C/svg%3E";
  const handleSelectMovie = async (movie: MovieSearchResult) => {
    if (movie.alreadyExists) {
      setError("This movie is already in your library.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get("https://www.omdbapi.com/", {
        params: {
          apikey: "e11f806f",
          i: movie.imdbID,
        },
      });

      if (response.data.Response === "True") {
        const detailedMovie: any = {
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
        };
        setSelectedMovie(detailedMovie);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching movie details.");
    }
    setLoading(false);
  };

  const handleAddMovie = async () => {
    if (selectedMovie) {
      setLoading(true);
      try {
        await addNewMovie(selectedMovie);
        onAddMovie(selectedMovie);
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
    setSelectedMovie(null);
    setError(null);
  };

  useEffect(() => {
      const handleSearch = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://www.omdbapi.com/", {
          params: {
            apikey: "e11f806f",
            s: searchQuery,
            type: "movie",
          },
        });

        if (response.data.Response === "True" && response.data.Search) {
          const movies = response.data.Search.map((item: any) => {
            const alreadyExists = posters.some(poster => poster.imdbID === item.imdbID);
            
            return {
              Title: item.Title,
              Year: item.Year,
              imdbID: item.imdbID,
              Type: item.Type,
              Poster: item.Poster,
              alreadyExists
            };
          });
          setSearchResults(movies);
          setError("");
          setExpanded(true);
        } else {
          setError("No movies found. Please try a different search.");
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while searching. Please try again.");
        setSearchResults([]);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setExpanded(false);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, posters]);

  return (
    <div className={`add-movie-panel ${expanded ? "expanded" : ""} ${loading ? "loading" : ""}`}>
      <h3>Add a Movie</h3>
      <div className="new-search-container">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {loading && !selectedMovie && (
          <div className="search-loading-indicator">
            <span className="loading-text">Searching...</span>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      
      {searchResults.length > 0 && !selectedMovie && (
        <div className="search-results">
          <div className="results-list">
            {searchResults.map((movie) => (
              <div 
                key={movie.imdbID} 
                className={`result-item ${movie.alreadyExists ? 'already-exists' : ''}`}
                onClick={() => !movie.alreadyExists && handleSelectMovie(movie)}
              >
                <img 
                  src={movie.Poster !== "N/A" ? movie.Poster : placeholderImage} 
                  alt={movie.Title} 
                  className="result-poster" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== placeholderImage) {
                      target.src = placeholderImage;
                    }
                  }}
                />
                <div className="result-info">
                  <h5>{movie.Title}</h5>
                  <p>{movie.Year} • {movie.Type}</p>
                  {movie.alreadyExists && (
                    <span className="already-exists-label">Already in library</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedMovie && (
        <div className="movie-details">
          <img 
            src={selectedMovie.poster && selectedMovie.poster !== "N/A" ? selectedMovie.poster : placeholderImage} 
            alt={selectedMovie.title} 
            className="movie-poster" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderImage) {
                target.src = placeholderImage;
              }
            }}
          />
          <div className="movie-info">
            <h4>
              {selectedMovie.title} ({selectedMovie.year})
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