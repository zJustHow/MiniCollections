import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NeuPressableButton, { buildPressableClassName } from "./NeuPressableButton";

describe("buildPressableClassName", () => {
  test("adds header and active modifiers", () => {
    expect(buildPressableClassName({ variant: "header-bar", active: true }))
      .toContain("neu-header-bar-btn");
    expect(buildPressableClassName({ variant: "header-bar", active: true }))
      .toContain("active");
  });
});

describe("NeuPressableButton", () => {
  test("handles click", async () => {
    const onClick = vi.fn();
    render(
      <NeuPressableButton filter active onClick={onClick}>
        Cars
      </NeuPressableButton>,
    );

    const button = screen.getByRole("button", { name: "Cars" });
    expect(button.className).toContain("neu-filter-tab-option");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
