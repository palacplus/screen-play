import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import LibraryStats from "../LibraryStats";
import { getStats } from "../../services/api/library";
import { StatsModel } from "@/types/library";

jest.mock("../../services/api/library", () => ({
  getStats: jest.fn(),
}));

const mockStats: StatsModel = {
  movieCount: 120,
  userCount: 45,
  ratingsCount: 300,
};

describe("LibraryStats Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the title and loading state initially", () => {
    render(<LibraryStats />);
    expect(screen.getByText("Library Overview")).toBeInTheDocument();
    expect(screen.queryByText(/Total Movies/i)).toBeInTheDocument();
  });

  test("fetches and displays stats correctly", async () => {
    (getStats as jest.Mock).mockResolvedValueOnce(mockStats);

    render(<LibraryStats />);

    await waitFor(() => {
      expect(screen.getByText("120")).toBeInTheDocument();
      expect(screen.getByText("45")).toBeInTheDocument();
      expect(screen.getByText("300")).toBeInTheDocument();
    });
  });
});
