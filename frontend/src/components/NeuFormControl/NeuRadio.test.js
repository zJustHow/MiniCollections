import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NeuRadio } from "./NeuRadio";

describe("NeuRadio.FilterOption", () => {
  test("renders neu-radio filter row and toggles on click", async () => {
    const onClick = vi.fn();
    render(
      <NeuRadio.FilterGroup>
        <NeuRadio.FilterOption
          label="Cars"
          count="12"
          checked={false}
          onClick={onClick}
        />
      </NeuRadio.FilterGroup>,
    );

    const row = screen.getByRole("checkbox", { name: /Cars/i });
    expect(row.className).toContain("neu-radio-filter-option");
    expect(row.querySelector(".neu-radio")).toBeTruthy();

    await userEvent.click(row);
    expect(onClick).toHaveBeenCalled();
  });
});
