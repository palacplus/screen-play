import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import AddMoviePanel from "../AddMoviePanel";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockSearchResponse = {
  Response: "True",
  Search: [
    {
      Title: "Inception",
      Year: "2010",
      imdbID: "tt1375666",
      Type: "movie",
      Poster: "https://example.com/poster.jpg"
    },
    {
      Title: "Inception: The App",
      Year: "2018",
      imdbID: "tt8888888",
      Type: "movie", 
      Poster: "N/A"
    }
  ]
};

const mockDetailResponse = {
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
};

describe("AddMoviePanel Component", () => {
  const mockOnAddMovie = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders the search input", () => {
    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    expect(screen.getByPlaceholderText("Search for a movie...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /search/i })).not.toBeInTheDocument();
  });

  test("triggers search automatically after typing with debounce", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockSearchResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("https://www.omdbapi.com/", {
        params: {
          apikey: "e11f806f",
          s: "Inception",
          type: "movie",
        },
      });
    });
  });

  test("displays search results when movies are found", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockSearchResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });

    jest.advanceTimersByTime(500);

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("2010 • movie")).toBeInTheDocument();
    expect(screen.getByText("Inception: The App")).toBeInTheDocument();
    expect(screen.getByText("2018 • movie")).toBeInTheDocument();
  });

  test("displays error message when no movies are found", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { Response: "False", Error: "Movie not found." },
    });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Nonexistent Movie" } });

    jest.advanceTimersByTime(500);

    expect(await screen.findByText("No movies found. Please try a different search.")).toBeInTheDocument();
  });

  test("shows movie details when a search result is clicked", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSearchResponse })
      .mockResolvedValueOnce({ data: mockDetailResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });

    jest.advanceTimersByTime(500);

    const movieResult = await screen.findByText("Inception");
    fireEvent.click(movieResult);

    expect(await screen.findByText("Inception (2010)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to library/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("calls onAddMovie and resets form when movie is added", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSearchResponse })
      .mockResolvedValueOnce({ data: mockDetailResponse });
    mockedAxios.post.mockResolvedValueOnce({ data: mockDetailResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });

    jest.advanceTimersByTime(500);

    const movieResult = await screen.findByText("Inception");
    fireEvent.click(movieResult);

    const addButton = await screen.findByRole("button", { name: /add to library/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddMovie).toHaveBeenCalled();
    });

    expect(screen.queryByText("Inception (2010)")).not.toBeInTheDocument();
  });

  test("resets form when cancel button is clicked", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSearchResponse })
      .mockResolvedValueOnce({ data: mockDetailResponse });

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });

    jest.advanceTimersByTime(500);

    const movieResult = await screen.findByText("Inception");
    fireEvent.click(movieResult);

    const cancelButton = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Inception (2010)")).not.toBeInTheDocument();
  });

  test("does not search for queries shorter than 2 characters", async () => {
    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "I" } });

    jest.advanceTimersByTime(500);

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test("shows loading indicator during search", async () => {
    mockedAxios.get.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ data: mockSearchResponse }), 1000)
    ));

    render(<AddMoviePanel onAddMovie={mockOnAddMovie} />);

    const searchInput = screen.getByPlaceholderText("Search for a movie...");
    fireEvent.change(searchInput, { target: { value: "Inception" } });

    jest.advanceTimersByTime(500);

    expect(await screen.findByText("Searching...")).toBeInTheDocument();
  });
});