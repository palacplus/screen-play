import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Poster from "../Poster";

describe("Poster Component", () => {
  const props = {
    imageUrl: "https://example.com/poster.jpg",
    title: "Inception",
    description: "A mind-bending thriller.",
    addedDate: "2025-04-01",
  };

  test("renders the poster image and title", () => {
    render(<Poster {...props} />);
    expect(screen.getByAltText("Inception")).toBeInTheDocument();
  });

  test("shows the popup when clicked", () => {
    render(<Poster {...props} />);
    fireEvent.click(screen.getByAltText("Inception"));
    expect(screen.getByText("A mind-bending thriller.")).toBeInTheDocument();
  });
});