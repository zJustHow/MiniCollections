import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailImage from "./DetailImage";

vi.mock("./GroovedImage", () => ({
  default: ({ imageUrl, alt, wellClassName, loading }) => (
    <div
      data-testid="grooved-image"
      data-url={imageUrl ?? ""}
      data-alt={alt ?? ""}
      data-loading={loading}
      className={wellClassName}
    />
  ),
}));

describe("DetailImage", () => {
  test("renders detail image well with grooved image", () => {
    render(<DetailImage imageUrl="models/m3.png" alt="BMW M3" />);

    const image = screen.getByTestId("grooved-image");
    expect(image).toHaveClass("neu-detail-image-well");
    expect(image).toHaveAttribute("data-url", "models/m3.png");
    expect(image).toHaveAttribute("data-alt", "BMW M3");
    expect(image).toHaveAttribute("data-loading", "eager");
  });

  test("forwards click handler on panel wrapper", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <DetailImage imageUrl="models/m3.png" alt="BMW M3" onClick={onClick} />,
    );

    const panel = container.querySelector(".neu-panel");
    expect(panel).toHaveStyle({ cursor: "pointer" });

    await userEvent.click(panel);
    expect(onClick).toHaveBeenCalled();
  });
});
