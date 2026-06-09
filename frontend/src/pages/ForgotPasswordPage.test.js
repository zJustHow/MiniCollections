import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
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

vi.mock("../utils/prefetchRoutes", () => ({
  prefetchLoginPage: vi.fn(),
}));

vi.mock("../components/SiteLogo", () => ({
  default: () => <div data-testid="site-logo">Logo</div>,
}));

vi.mock("../utils", () => ({
  sendForgotPasswordCode: vi.fn(),
  resetPassword: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

function renderForgotPasswordPage() {
  const router = createMemoryRouter(
    [{ path: "/forgot-password", element: <ForgotPasswordPage /> }],
    { initialEntries: ["/forgot-password"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("ForgotPasswordPage", () => {
  test("renders forgot password form", () => {
    renderForgotPasswordPage();

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(screen.getByText("forgotPassword")).toBeInTheDocument();
    expect(screen.getByText("forgotPasswordHint")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "resetPassword" })).toBeInTheDocument();
  });

  test("links back to login from footer link", () => {
    renderForgotPasswordPage();

    expect(screen.getByRole("link", { name: "backToSignIn" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
