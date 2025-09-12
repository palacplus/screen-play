import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Poster from "../Poster";
import { MoviePartial } from "@/types/library";

describe("Poster Component", () => {
  const movie: MoviePartial = {
    poster: "https://example.com/poster.jpg",
    title: "Inception",
    plot: "A mind-bending thriller.",
    addedDate: new Date("2025-03-01"),
    released: "2010-07-16",
    year: "2010",
    rated: "PG-13",
    runtime: "148 min",
    genre: "Action, Adventure, Sci-Fi",
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
    tmdbId: 0
  };

  test("renders the poster image and title", () => {
    render(<Poster movie={movie} />);
    expect(screen.getByAltText("Inception")).toBeInTheDocument();
  });

  test("shows the 'Recently Added' banner if added within the last 2 weeks", () => {
    const newMovie = {
      ...movie,
      addedDate: new Date(),
    };
    render(<Poster movie={newMovie} />);
    expect(screen.getByText("Recently Added")).toBeInTheDocument();
  });

  test("does not show the 'Recently Added' banner if added more than 2 weeks ago", () => {
    const oldMovie = {
      ...movie,
      addedDate: new Date("2023-01-01"),
    };
    render(<Poster movie={oldMovie} />);
    expect(screen.queryByText("Recently Added")).not.toBeInTheDocument();
  }
  );
});