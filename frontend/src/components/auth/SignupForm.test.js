import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({
    t: (key) => key,
    setLocale: vi.fn(),
    locale: "en-US",
  }),
}));

vi.mock("../../utils", () => ({
  signup: vi.fn(),
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
}));

vi.mock("../NeuFormDrawer", () => ({
  default: ({ open, title, children }) =>
    open ? (
      <div data-testid="signup-drawer">
        <div>{title}</div>
        {children}
      </div>
    ) : null,
}));

import { signup } from "../../utils";

describe("SignupForm", () => {
  beforeEach(() => {
    vi.mocked(signup).mockResolvedValue(undefined);
  });

  test("opens registration drawer", async () => {
    render(<SignupForm />);

    await userEvent.click(screen.getByRole("button", { name: "register" }));

    expect(screen.getByTestId("signup-drawer")).toBeInTheDocument();
    expect(screen.getByText("registerWithEmail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
  });

  test("submits email registration", async () => {
    render(<SignupForm />);

    await userEvent.click(screen.getByRole("button", { name: "register" }));
    await userEvent.type(screen.getByPlaceholderText("email"), "alice@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "secret12");
    await userEvent.type(screen.getByPlaceholderText("username"), "Alice");
    await userEvent.click(screen.getAllByRole("button", { name: "register" })[1]);

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "alice@example.com",
          password: "secret12",
          name: "Alice",
        }),
      );
    });
  });
});
