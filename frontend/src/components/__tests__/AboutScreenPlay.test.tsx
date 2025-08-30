import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import About from "../About";

describe("About Component", () => {
  test("renders the welcome message", () => {
    render(<About />);
    expect(screen.getByText("Welcome to ScreenPlay!")).toBeInTheDocument();
  });

  test("renders the description text", () => {
    render(<About />);
    expect(
      screen.getByText(/ScreenPlay is your ultimate movie library management system/i)
    ).toBeInTheDocument();
  });
});