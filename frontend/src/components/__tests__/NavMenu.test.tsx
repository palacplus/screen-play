import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavMenu from "../NavMenu";

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("NavMenu Component", () => {
  const renderNavMenu = () => {
    render(
      <MemoryRouter>
        <NavMenu />
      </MemoryRouter>
    );
  };

  test("renders the logo and navigation links", () => {
    renderNavMenu();

    // Check for the logo
    expect(screen.getByRole("link", { name: /screenplay logo/i })).toBeInTheDocument();

    // Check for the "Movie Library" link
    expect(screen.getByRole("link", { name: /movie library/i })).toBeInTheDocument();
  });

  test("toggles the navbar when the toggler is clicked", () => {
    renderNavMenu();

    const toggler = screen.getByRole("button", { name: /toggle navigation/i });
    expect(toggler).toBeInTheDocument();

    // Simulate clicking the toggler
    fireEvent.click(toggler);

    // Check if the navbar is expanded (this depends on the `collapsed` state)
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("navigates to the library with a search query", () => {
    renderNavMenu();

    const searchInput = screen.getByPlaceholderText(/search library.../i);
    const form = screen.getByRole("form");

    // Simulate entering a search query
    fireEvent.change(searchInput, { target: { value: "Inception" } });
    expect(searchInput).toHaveValue("Inception");

    // Simulate submitting the form
    fireEvent.submit(form);

    // Check if the navigate function was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith("/library?title=Inception");
  });

  test("navigates to the library without a search query", () => {
    renderNavMenu();

    const form = screen.getByRole("form");

    // Simulate submitting the form without entering a search query
    fireEvent.submit(form);

    // Check if the navigate function was called with the default library URL
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  test("renders the dropdown menu", () => {
    renderNavMenu();

    // Check if the dropdown menu is rendered
    expect(screen.getByRole("button", { name: /menu/ })).toBeInTheDocument();
  });
});