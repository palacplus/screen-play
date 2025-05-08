import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LibraryShelf from "../LibraryShelf";
import { MoviePartial } from "@/types/library";

describe("LibraryShelf Component", () => {
  const movies: MoviePartial[] = [
    {
      poster: "https://example.com/poster.jpg",
      title: "Inception",
      plot: "A mind-bending thriller.",
      addedDate: new Date("2025-04-01"),
      released: "2010-07-16",
      year: "2010",
      rated: "PG-13",
      runtime: "148 min",
      genre: "Sci-Fi",
      director: "Christopher Nolan",
      writer: "Christopher Nolan",
      actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
      language: "English",
      country: "USA",
      awards: "Oscar Nominated",
      ratings: [
        { source: "Internet Movie Database", value: "8.8/10" },
        { source: "Rotten Tomatoes", value: "86%" },
        { source: "Metacritic", value: "74/100" },
      ],
      metascore: "74",
      imdbRating: "8.8",
      imdbVotes: "2000000",
      imdbID: "tt1375666",
      boxOffice: "$836,836,967",
    },
    {
      poster: "https://example.com/poster2.jpg",
      title: "The Matrix",
      plot: "A sci-fi classic.",
      addedDate: new Date("2025-04-01"),
      released: "1999-03-31",
      year: "1999",
      rated: "R",
      runtime: "136 min",
      genre: "Action, Sci-Fi",
      director: "The Wachowskis",
      writer: "The Wachowskis",
      actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
      language: "English",
      country: "USA",
      awards: "4 Oscars",
      ratings: [
        { source: "Internet Movie Database", value: "8.7/10" },
        { source: "Rotten Tomatoes", value: "88%" },
        { source: "Metacritic", value: "73/100" },
      ],
      metascore: "73",
      imdbRating: "8.7",
      imdbVotes: "1700000",
      imdbID: "tt0133093",
      boxOffice: "$463,517,383",
    },
  ];

  test("renders all posters", () => {
    render(<LibraryShelf posters={movies} isLoading={false}/>);
    movies.forEach((movie) => {
      expect(screen.getByAltText(movie.title)).toBeInTheDocument();
    });
  });

  test("renders no posters when the list is empty", () => {
    render(<LibraryShelf posters={[]} isLoading={false}/>);
    expect(screen.getByText("No movies found.")).toBeInTheDocument();
  });

  test("renders a poster with missing optional fields", () => {
    const incompleteMovie: MoviePartial = {
      poster: "https://example.com/poster3.jpg",
      title: "Interstellar",
      plot: "A journey through space and time.",
      addedDate: new Date("2025-04-01"),
      released: null,
      year: null,
      rated: null,
      runtime: null,
      genre: "Sci-Fi",
      director: null,
      writer: null,
      actors: null,
      language: null,
      country: null,
      awards: null,
      ratings: null,
      metascore: null,
      imdbRating: null,
      imdbVotes: null,
      imdbID: null,
      boxOffice: null,
    };

    render(<LibraryShelf posters={[incompleteMovie]} isLoading={false}/>);
    expect(screen.getByAltText(incompleteMovie.title)).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  });

  test("renders genres correctly when grouped by genre", () => {
    render(<LibraryShelf posters={movies} isLoading={false}/>);
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  });
});