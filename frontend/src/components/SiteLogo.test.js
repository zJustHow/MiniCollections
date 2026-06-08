import { render, screen } from "@testing-library/react";
import SiteLogo from "./SiteLogo";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("SiteLogo", () => {
  test("renders brand title", () => {
    render(<SiteLogo />);

    expect(screen.getByText(/Mini/i)).toBeInTheDocument();
    expect(screen.getByText(/Collections/i)).toBeInTheDocument();
  });
});
