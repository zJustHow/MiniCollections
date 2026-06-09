import { render, screen } from "@testing-library/react";
import NeuTag, { buildNeuTagClassName } from "./NeuTag";

describe("buildNeuTagClassName", () => {
  test("adds color modifier class", () => {
    expect(buildNeuTagClassName({ color: "green" })).toContain("neu-tag--green");
  });
});

describe("NeuTag", () => {
  test("renders children with neu-tag class", () => {
    render(<NeuTag color="blue">Pending</NeuTag>);

    const tag = screen.getByText("Pending");
    expect(tag).toHaveClass("neu-tag");
    expect(tag).toHaveClass("neu-tag--blue");
  });
});
