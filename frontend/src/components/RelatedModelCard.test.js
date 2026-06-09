import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RelatedModelCard from "./RelatedModelCard";

vi.mock("./NeuCard", () => ({
  default: ({ name, meta, onClick }) => (
    <button type="button" onClick={onClick}>
      {name}
      {meta ? ` · ${meta}` : ""}
    </button>
  ),
}));

describe("RelatedModelCard", () => {
  test("renders linked model name and metadata", () => {
    const onClick = vi.fn();
    render(
      <RelatedModelCard
        brandObject={{
          name: "BMW M3",
          category: "Cars",
          scale: "1:64",
          image_url: "models/m3.png",
        }}
        onClick={onClick}
      />,
    );

    expect(screen.getByRole("button", { name: "BMW M3 · Cars · 1:64" })).toBeInTheDocument();
  });

  test("handles click", async () => {
    const onClick = vi.fn();
    render(
      <RelatedModelCard
        brandObject={{ name: "BMW M3", imageUrl: null }}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "BMW M3" }));
    expect(onClick).toHaveBeenCalled();
  });
});
