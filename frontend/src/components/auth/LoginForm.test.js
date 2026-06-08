import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en-US" }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../utils", () => ({
  login: vi.fn(),
  getWechatAuthUrl: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

import { login } from "../../utils";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(login).mockResolvedValue({});
  });

  test("renders email login by default", () => {
    render(<LoginForm onSuccess={vi.fn()} />);

    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "signIn" })).toBeInTheDocument();
  });

  test("submits email credentials", async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

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
