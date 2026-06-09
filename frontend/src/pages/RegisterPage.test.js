import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./RegisterPage";

const mockSetLocale = vi.fn();

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
    setLocale: mockSetLocale,
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
  beforeEach(() => {
    mockSetLocale.mockClear();
  });

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

  test("clicking Chinese language button calls setLocale with zh-CN", () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole("button", { name: "中文" }));

    expect(mockSetLocale).toHaveBeenCalledWith("zh-CN");
  });
});
