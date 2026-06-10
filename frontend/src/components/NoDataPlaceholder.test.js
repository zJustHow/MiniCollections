import { render, screen } from "@testing-library/react";
import NoDataPlaceholder from "./NoDataPlaceholder";

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

describe("NoDataPlaceholder", () => {
  test("renders unified no-data label", () => {
    render(<NoDataPlaceholder />);

    expect(screen.getByText("noData")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
