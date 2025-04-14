import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Popup from "../Popup";

describe("Popup Component", () => {
  const props = {
    imageUrl: "https://example.com/poster.jpg",
    title: "Inception",
    description: "A mind-bending thriller.",
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