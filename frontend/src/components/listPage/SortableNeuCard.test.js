import { render, screen } from "@testing-library/react";
import SortableNeuCard from "./SortableNeuCard";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: { "data-testid": "sortable-attrs" },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("../NeuCard", () => ({
  default: ({ name }) => <span>{name}</span>,
}));

describe("SortableNeuCard", () => {
  test("marks wrapper as sortable when sorting is enabled", () => {
    const { container } = render(
      <SortableNeuCard id={1} sortEnabled name="Kyosho" imageUrl={null} onClick={vi.fn()} />,
    );

    expect(container.querySelector(".neu-sortable-card-wrap--sortable")).toBeTruthy();
    expect(screen.getByTestId("sortable-attrs")).toBeInTheDocument();
    expect(screen.getByText("Kyosho")).toBeInTheDocument();
  });

  test("renders overlay copy without sortable hooks", () => {
    const { container } = render(
      <SortableNeuCard overlay id={1} sortEnabled name="Kyosho" imageUrl={null} onClick={vi.fn()} />,
    );

    expect(container.querySelector(".neu-sortable-card-wrap--overlay")).toBeTruthy();
    expect(screen.queryByTestId("sortable-attrs")).not.toBeInTheDocument();
    expect(screen.getByText("Kyosho")).toBeInTheDocument();
  });

  test("does not mark wrapper as sortable when sorting is disabled", () => {
    const { container } = render(
      <SortableNeuCard id={1} sortEnabled={false} name="Kyosho" imageUrl={null} onClick={vi.fn()} />,
    );

    expect(container.querySelector(".neu-sortable-card-wrap--sortable")).toBeNull();
    expect(screen.queryByTestId("sortable-attrs")).not.toBeInTheDocument();
  });
});
