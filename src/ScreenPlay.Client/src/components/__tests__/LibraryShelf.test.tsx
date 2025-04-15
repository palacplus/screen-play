import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LibraryShelf from "../LibraryShelf";

describe("LibraryShelf Component", () => {
  const posters = [
    {
      imageUrl: "https://example.com/poster1.jpg",
      title: "Inception",
      description: "A mind-bending thriller.",
      addedDate: "2025-04-01",
    },
    {
      imageUrl: "https://example.com/poster2.jpg",
      title: "The Matrix",
      description: "A sci-fi classic.",
      addedDate: "2025-03-15",
    },
  ];

  test("renders all posters", () => {
    render(<LibraryShelf posters={posters} />);
    posters.forEach((poster) => {
      expect(screen.getByAltText(poster.title)).toBeInTheDocument();
    });
  });
});