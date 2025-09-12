import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Popup from "../Popup";
import { MoviePartial } from "@/types/library";

describe("Popup Component", () => {
    const movie: MoviePartial = {
      poster: "https://example.com/poster.jpg",
      title: "Inception",
      plot: "A mind-bending thriller.",
      addedDate: new Date("2025-04-01"),
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

  const props = {
    movie,
    onClose: jest.fn(),
  };

  test("renders the popup content", () => {
    render(<Popup {...props} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("A mind-bending thriller.")).toBeInTheDocument();
    expect(screen.getByAltText("Inception")).toBeInTheDocument();
  });

  test("calls onClose when the close button is clicked", () => {
    render(<Popup {...props} />);
    fireEvent.click(screen.getByText("×"));
    expect(props.onClose).toHaveBeenCalled();
  });
});