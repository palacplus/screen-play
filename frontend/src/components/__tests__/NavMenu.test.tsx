import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavMenu from "../NavMenu";

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
    expect(screen.getByRole("link", { name: /screenplay logo/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /movie library/i })).toBeInTheDocument();
  });

  test("toggles the navbar when the toggler is clicked", () => {
    renderNavMenu();
    const toggler = screen.getByRole("button", { name: /toggle navigation/i });
    expect(toggler).toBeInTheDocument();
    fireEvent.click(toggler);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("navigates to the library with a search query", () => {
    renderNavMenu();
    const searchInput = screen.getByPlaceholderText(/search library.../i);
    const form = screen.getByRole("form");
    fireEvent.change(searchInput, { target: { value: "Inception" } });
    expect(searchInput).toHaveValue("Inception");
    fireEvent.submit(form);
    expect(mockNavigate).toHaveBeenCalledWith("/library?title=Inception");
  });

  test("navigates to the library without a search query", () => {
    renderNavMenu();
    const form = screen.getByRole("form");
    fireEvent.submit(form);
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  test("renders the dropdown menu", () => {
    renderNavMenu();
    expect(screen.getByRole("button", { name: /menu/ })).toBeInTheDocument();
  });
});