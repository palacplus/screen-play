import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FormErrors } from "../FormErrors";

describe("FormErrors", () => {
  it("renders nothing when there are no errors", () => {
    render(<FormErrors />);
    expect(screen.queryByText(/.+/)).toBeNull(); // Ensures no content is rendered
  });

  it("renders the first error message when errors are provided", () => {
    const errors = ["Error 1", "Error 2"];
    render(<FormErrors errors={errors} />);
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.queryByText("Error 2")).toBeNull(); // Only the first error is rendered
  });

  it("renders the error message with the default red color", () => {
    const errors = ["Error 1"];
    render(<FormErrors errors={errors} />);
    const errorElement = screen.getByText("Error 1");
    expect(errorElement).toHaveStyle("color: red");
  });

  it("renders the error message with a custom color when provided", () => {
    const errors = ["Error 1"];
    render(<FormErrors errors={errors} color="blue" />);
    const errorElement = screen.getByText("Error 1");
    expect(errorElement).toHaveStyle("color: blue");
  });

  it("renders the error message centered", () => {
    const errors = ["Error 1"];
    render(<FormErrors errors={errors} />);
    const errorElement = screen.getByText("Error 1");
    expect(errorElement).toHaveStyle("text-align: center");
    expect(errorElement).toHaveStyle("display: block");
  });
});