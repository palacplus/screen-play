import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import AddMoviePanel from "../AddMoviePanel";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse = {
  Title: "Inception",
  Year: "2010",
  Rated: "PG-13",
  Released: "2010-07-16",
  Runtime: "148 min",
  Genre: "Action, Adventure, Sci-Fi",
  Director: "Christopher Nolan",
  Writer: "Christopher Nolan",
  Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
  Plot: "A mind-bending thriller.",
  Language: "English",
  Country: "USA",
  Awards: "Oscar Nominated",
  Poster: "https://example.com/poster.jpg",
  Ratings: [{ source: "Internet Movie Database", value: "8.8/10" }],
  Metascore: "74",
  imdbRating: "8.8",
  imdbVotes: "2000000",
  imdbID: "tt1375666",
  BoxOffice: "$836,836,967",
  Response: "True",
  Type: "movie",
};

describe("AddMoviePanel Component", () => {
  const mockOnAddMovie = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the search input and button", () => {
    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    expect(screen.getByPlaceholderText("Search for a movie...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  test("displays an error message when the search query is empty", async () => {
    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(await screen.findByText("Please enter a movie name.")).toBeInTheDocument();
  });

  test("displays an error message when the movie is not found", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { Response: "False", Error: "Movie not found." },
    });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(searchInput, { target: { value: "Nonexistent Movie" } });
    fireEvent.click(searchButton);

    expect(await screen.findByText("Movie not found. Please try again.")).toBeInTheDocument();
  });

  test("displays movie details when a movie is found", async () => {

    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(searchInput, { target: { value: "Inception" } });
    fireEvent.click(searchButton);

    expect(await screen.findByText("Inception (2010)")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /inception/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to library/i })).toBeInTheDocument();
  });

  test("calls onAddMovie and resets the form when a movie is added", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(searchInput, { target: { value: "Inception" } });
    fireEvent.click(searchButton);

    const addButton = await screen.findByRole("button", { name: /add to library/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddMovie).toHaveBeenCalled();
    });

    expect(searchInput).toHaveValue("");
    expect(screen.queryByText("Inception (2010)")).not.toBeInTheDocument();
  });

  test("resets the form when the cancel button is clicked", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(searchInput, { target: { value: "Inception" } });
    fireEvent.click(searchButton);

    const cancelButton = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(searchInput).toHaveValue("");
    expect(screen.queryByText("Inception (2010)")).not.toBeInTheDocument();
  });
});