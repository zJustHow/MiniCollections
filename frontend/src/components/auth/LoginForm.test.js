import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en-US" }),
}));

vi.mock("../../utils/prefetchRoutes", () => ({
  prefetchAuthPages: vi.fn(),
  prefetchForgotPasswordPage: vi.fn(),
  prefetchRegisterPage: vi.fn(),
}));

vi.mock("../../utils", () => ({
  login: vi.fn(),
  getWechatAuthUrl: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

import { login } from "../../utils";

function renderLoginForm(props = {}) {
  return render(
    <MemoryRouter>
      <LoginForm onSuccess={vi.fn()} {...props} />
    </MemoryRouter>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(login).mockResolvedValue({});
  });

  test("renders email login by default", () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "signIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "forgotPassword" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("link", { name: "signUp" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  test("submits email credentials", async () => {
    const onSuccess = vi.fn();
    renderLoginForm({ onSuccess });

    await userEvent.type(screen.getByPlaceholderText("email"), "alice@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "signIn" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        identifier: "alice@example.com",
        password: "secret",
        loginType: "email",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
