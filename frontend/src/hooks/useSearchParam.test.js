import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useSearchParam from "./useSearchParam";

function SearchProbe({ paramKey = "q" }) {
  const [value, setValue] = useSearchParam(paramKey);
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button type="button" onClick={() => setValue("bmw")}>
        set
      </button>
      <button type="button" onClick={() => setValue("")}>
        clear
      </button>
    </div>
  );
}

describe("useSearchParam", () => {
  test("reads search param value", () => {
    render(
      <MemoryRouter initialEntries={["/?q=mini"]}>
        <Routes>
          <Route path="*" element={<SearchProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("value")).toHaveTextContent("mini");
  });

  test("setValue updates URL with replace semantics", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<SearchProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("value")).toHaveTextContent("bmw");

    await userEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByTestId("value")).toHaveTextContent("");
  });
});
