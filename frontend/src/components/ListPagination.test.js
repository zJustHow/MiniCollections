import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListPagination from "./ListPagination";

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Grid: {
      useBreakpoint: () => ({ lg: true }),
    },
  };
});

describe("ListPagination", () => {
  test("renders nothing for a single page", () => {
    const { container } = render(
      <ListPagination page={0} totalPages={1} loading={false} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders page controls and navigates forward", async () => {
    const onPageChange = vi.fn();
    render(
      <ListPagination page={0} totalPages={3} loading={false} onPageChange={onPageChange} />,
    );

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("nextPage"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("disables previous on first page", () => {
    render(
      <ListPagination page={0} totalPages={4} loading={false} onPageChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("previousPage")).toBeDisabled();
  });

  test("disables all pagination controls while loading", () => {
    render(
      <ListPagination page={1} totalPages={4} loading onPageChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("previousPage")).toBeDisabled();
    expect(screen.getByLabelText("nextPage")).toBeDisabled();
    expect(screen.getByRole("button", { name: "2" })).toBeDisabled();
  });
});
