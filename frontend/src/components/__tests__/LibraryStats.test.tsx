import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LibraryStats from "../LibraryStats";

describe("LibraryStats Component", () => {
  const metrics = {
    totalMovies: 100,
    activeUsers: 50,
    totalHoursWatched: 200,
    totalRatings: 300,
    topTitles: ["Inception", "The Matrix", "Jurassic Park"],
  };

  test("renders all metrics", () => {
    render(<LibraryStats {...metrics} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Total Movies")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  test("renders the top 3 titles", () => {
    render(<LibraryStats {...metrics} />);
    metrics.topTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});