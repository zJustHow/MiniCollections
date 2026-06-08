import { render, screen } from "@testing-library/react";
import ProfilePage from "./ProfilePage";

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

vi.mock("../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: vi.fn() }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../utils", () => ({
  COUNTRIES: [{ code: "+86", en: "China", zh: "中国" }],
  getWechatAuthUrl: vi.fn(),
  parsePhone: () => ({ countryCode: "+86", phoneNumber: "" }),
  sendCode: vi.fn(),
  updateIdentifier: vi.fn(),
  updateLocale: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
}));

const sampleProfile = {
  display_name: "Alice",
  email: "alice@example.com",
  avatar_url: null,
  phone: null,
  preferred_locale: "en-US",
  wechat_bound: false,
};

describe("ProfilePage", () => {
  test("renders profile display name and email", () => {
    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });
});
