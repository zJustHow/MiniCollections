import { render, screen } from "@testing-library/react";
import LoginPage from "./LoginPage";

vi.mock("../components/SiteLogo", () => ({
  default: () => <div data-testid="site-logo">Logo</div>,
}));

vi.mock("../components/auth/LoginForm", () => ({
  default: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess?.()}>
      login-form
    </button>
  ),
}));

describe("LoginPage", () => {
  test("renders logo and login form", () => {
    render(<LoginPage onSuccess={vi.fn()} />);

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "login-form" })).toBeInTheDocument();
  });
});
