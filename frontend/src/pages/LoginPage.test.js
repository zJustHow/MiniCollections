import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("calls onSuccess when login form succeeds", async () => {
    const onSuccess = vi.fn();
    render(<LoginPage onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole("button", { name: "login-form" }));

    expect(onSuccess).toHaveBeenCalled();
  });
});
