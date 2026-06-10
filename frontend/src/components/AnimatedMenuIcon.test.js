import { render, screen } from "@testing-library/react";
import AnimatedMenuIcon from "./AnimatedMenuIcon";

describe("AnimatedMenuIcon", () => {
  test("renders closed hamburger icon", () => {
    const { container } = render(<AnimatedMenuIcon />);
    const icon = container.querySelector(".neu-menu-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveClass("neu-menu-icon--open");
    expect(icon.querySelectorAll(".neu-menu-icon-bar")).toHaveLength(3);
  });

  test("renders open state class", () => {
    const { container } = render(<AnimatedMenuIcon open />);
    expect(container.querySelector(".neu-menu-icon")).toHaveClass(
      "neu-menu-icon--open",
    );
  });

  test("is hidden from assistive tech", () => {
    const { container } = render(<AnimatedMenuIcon />);
    expect(container.querySelector(".neu-menu-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
