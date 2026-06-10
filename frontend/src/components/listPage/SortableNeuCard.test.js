import { render, screen } from "@testing-library/react";
import SortableNeuCard from "./SortableNeuCard";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: { "data-testid": "sortable-attrs" },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("../NeuCard", () => ({
  default: ({ frameAction, name }) => (
    <div>
      {frameAction}
      <span>{name}</span>
    </div>
  ),
}));

describe("SortableNeuCard", () => {
  test("shows drag handle when sorting is enabled", () => {
    render(
      <SortableNeuCard id={1} sortEnabled name="Kyosho" imageUrl={null} onClick={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Reorder" })).toBeInTheDocument();
    expect(screen.getByText("Kyosho")).toBeInTheDocument();
  });

  test("hides drag handle when sorting is disabled", () => {
    render(
      <SortableNeuCard id={1} sortEnabled={false} name="Kyosho" imageUrl={null} onClick={vi.fn()} />,
    );

    expect(screen.queryByRole("button", { name: "Reorder" })).not.toBeInTheDocument();
  });
});
