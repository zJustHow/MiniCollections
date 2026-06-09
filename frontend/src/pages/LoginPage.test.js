import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
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

function renderLoginPage(props = {}) {
  const router = createMemoryRouter(
    [{ path: "/login", element: <LoginPage {...props} /> }],
    { initialEntries: ["/login"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("LoginPage", () => {
  test("renders logo and login form", () => {
    renderLoginPage({ onSuccess: vi.fn() });

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "login-form" })).toBeInTheDocument();
  });

  test("calls onSuccess when login form succeeds", async () => {
    const onSuccess = vi.fn();
    renderLoginPage({ onSuccess });

    await userEvent.click(screen.getByRole("button", { name: "login-form" }));

    expect(onSuccess).toHaveBeenCalled();
  });
});
