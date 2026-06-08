import { render, screen } from "@testing-library/react";
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
  signup: vi.fn(),
  sendCode: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

describe("RegisterPage", () => {
  test("renders register title and email toggle", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("site-logo")).toBeInTheDocument();
    expect(document.querySelector(".neu-login-title")).toHaveTextContent("register");
    expect(screen.getByText("registerWithEmail")).toBeInTheDocument();
  });
});
