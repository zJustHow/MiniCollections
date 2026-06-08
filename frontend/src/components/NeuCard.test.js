import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NeuCard, { buildNeuCardClassName } from "./NeuCard";

vi.mock("./GroovedImage", () => ({
  default: ({ alt }) => <img alt={alt} data-testid="grooved-image" />,
}));

describe("buildNeuCardClassName", () => {
  test("adds row and upload variant classes", () => {
    expect(buildNeuCardClassName({ variant: "row" })).toContain("neu-card--row");
    expect(buildNeuCardClassName({ variant: "upload" })).toContain("neu-card--upload");
  });
});

describe("NeuCard", () => {
  test("renders catalog tile with name and handles click", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <NeuCard name="Kyosho" imageUrl={null} onClick={onClick} />,
    );

    expect(screen.getByText("Kyosho")).toBeInTheDocument();
    await userEvent.click(container.querySelector(".neu-card"));
    expect(onClick).toHaveBeenCalled();
  });

  test("renders add card variant", async () => {
    const onClick = vi.fn();
    const { container } = render(<NeuCard add onClick={onClick} />);

    await userEvent.click(container.querySelector(".neu-card"));
    expect(onClick).toHaveBeenCalled();
  });
});
