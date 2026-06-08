import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "./ForgotPasswordPage";

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
    useNavigate: () => vi.fn(),
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
  test("renders forgot password form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(screen.getByText("forgotPassword")).toBeInTheDocument();
    expect(screen.getByText("forgotPasswordHint")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "resetPassword" })).toBeInTheDocument();
  });
});
