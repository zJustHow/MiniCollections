import { render } from "@testing-library/react";
import GroovedImage from "./GroovedImage";

vi.mock("./useAdaptiveImageFrame", () => ({
  useAdaptiveImageFrame: () => ({
    wellRef: { current: null },
    frameSize: null,
    imageDisplayable: false,
    onImageLoad: vi.fn(),
    onImageError: vi.fn(),
  }),
  IMAGE_ACTION_RESERVE_PX: 42,
}));

vi.mock("../utils", () => ({
  resolveMediaUrl: (url) => (url ? `https://cdn.test/${url}` : null),
}));

describe("GroovedImage", () => {
  test("renders placeholder groove when image is missing", () => {
    const { container } = render(<GroovedImage alt="Model" />);

    expect(container.querySelector(".neu-card-image-groove")).toBeInTheDocument();
    expect(container.querySelector(".neu-card-image-placeholder")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  test("renders image element when url is provided", () => {
    const { container } = render(
      <GroovedImage imageUrl="models/m3.png" alt="BMW M3" />,
    );

    const img = container.querySelector(".neu-card-image-preload");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://cdn.test/models/m3.png");
  });
});
