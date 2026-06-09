import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./ForgotPasswordPage";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: "en-US",
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../components/SiteLogo", () => ({
  default: () => <div data-testid="site-logo">Logo</div>,
}));

vi.mock("../utils", () => ({
  sendForgotPasswordCode: vi.fn(),
  resetPassword: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  test("renders forgot password form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(screen.getByText("forgotPassword")).toBeInTheDocument();
    expect(screen.getByText("forgotPasswordHint")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "resetPassword" })).toBeInTheDocument();
  });

  test("navigates back to login from footer link", async () => {
    render(<ForgotPasswordPage />);

    await userEvent.click(screen.getByText("backToSignIn"));

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
