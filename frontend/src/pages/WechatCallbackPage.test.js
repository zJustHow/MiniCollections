import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import WechatCallbackPage from "./WechatCallbackPage";

const mockNavigate = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnBind = vi.fn();

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../utils", () => ({
  exchangeWechatCode: vi.fn(),
  bindWechatAccount: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { bindWechatAccount, exchangeWechatCode } from "../utils";

function renderPage(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/callback${search}`]}>
      <Routes>
        <Route
          path="/callback"
          element={<WechatCallbackPage onSuccess={mockOnSuccess} onBind={mockOnBind} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("WechatCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(exchangeWechatCode).mockResolvedValue({ token: "jwt" });
    vi.mocked(bindWechatAccount).mockResolvedValue({ display_name: "Alice" });
  });

  test("shows login error when code is missing", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("wechatLoginFailed")).toBeInTheDocument();
    });
  });

  test("exchanges code for login", async () => {
    renderPage("?code=abc&state=xyz");

    await waitFor(() => {
      expect(exchangeWechatCode).toHaveBeenCalledWith({ code: "abc", state: "xyz" });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("binds wechat when intent is bind", async () => {
    localStorage.setItem("wechat_intent", "bind");
    renderPage("?code=bind-code&state=bind-state");

    await waitFor(() => {
      expect(bindWechatAccount).toHaveBeenCalledWith({
        code: "bind-code",
        state: "bind-state",
      });
      expect(mockOnBind).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
    });
  });

  test("shows exchange error when login fails", async () => {
    vi.mocked(exchangeWechatCode).mockRejectedValue(new Error("wechat failed"));
    renderPage("?code=abc&state=xyz");

    await waitFor(() => {
      expect(screen.getByText("wechat failed")).toBeInTheDocument();
    });
  });

  test("shows bind error when binding fails", async () => {
    localStorage.setItem("wechat_intent", "bind");
    vi.mocked(bindWechatAccount).mockRejectedValue(new Error("bind failed"));
    renderPage("?code=bind-code&state=bind-state");

    await waitFor(() => {
      expect(screen.getByText("bind failed")).toBeInTheDocument();
    });
  });
});
