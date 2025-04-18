import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingOverlay from "../LoadingOverlay";

describe("LoadingOverlay Component", () => {
    test("should not render anything when isLoading is false", () => {
        render(<LoadingOverlay isLoading={false} />);
        const overlay = screen.queryByTestId("loading-overlay");
        expect(overlay).not.toBeInTheDocument();
    });

    test("should render the overlay and spinner when isLoading is true", () => {
        render(<LoadingOverlay isLoading={true} />);
        const overlay = screen.getByTestId("loading-overlay");
        expect(overlay).toBeInTheDocument();
        expect(overlay).toHaveStyle("background-color: rgba(255, 255, 255, 0.8)");

        const spinner = screen.getByTestId("loading-overlay").querySelector("div");
        expect(spinner).toBeInTheDocument();
    });

    test("should apply blur effect to the parent element when isLoading is true", () => {
        const { container } = render(
            <div data-testid="parent">
                <LoadingOverlay isLoading={true} />
            </div>
        );

        const parent = container.querySelector("[data-testid='parent']");
        expect(parent).toHaveStyle("filter: blur(1.5px)");
        expect(parent).toHaveStyle("pointer-events: none");
    });

    test("should remove blur effect from the parent element when isLoading becomes false", () => {
        const { rerender, container } = render(
            <div data-testid="parent">
                <LoadingOverlay isLoading={true} />
            </div>
        );

        const parent = container.querySelector("[data-testid='parent']");
        expect(parent).toHaveStyle("filter: blur(1.5px)");

        // Rerender with isLoading set to false
        rerender(
            <div data-testid="parent">
                <LoadingOverlay isLoading={false} />
            </div>
        );
        expect(parent).not.toHaveStyle("filter: blur(1.5px)");
    });
});