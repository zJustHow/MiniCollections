import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./RegisterPage";

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
    setLocale: vi.fn(),
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
  signup: vi.fn(),
  sendCode: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

function renderRegisterPage() {
  const router = createMemoryRouter(
    [{ path: "/register", element: <RegisterPage /> }],
    { initialEntries: ["/register"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("RegisterPage", () => {
  test("renders register title and email toggle", () => {
    renderRegisterPage();

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(document.querySelector(".neu-login-title")).toHaveTextContent("register");
    expect(screen.getByText("registerWithEmail")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "signIn" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
