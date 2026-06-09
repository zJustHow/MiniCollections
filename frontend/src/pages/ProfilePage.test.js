import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./ProfilePage";

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const localeMocks = vi.hoisted(() => ({
  t: (key) => key,
  locale: "en-US",
}));

const headerMocks = vi.hoisted(() => ({
  slot: null,
  setHeaderSlot: vi.fn((node) => {
    headerMocks.slot = node;
  }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const Upload = ({ id, onChange, children }) => (
    <div id={id}>
      {children}
      <input
        type="file"
        data-testid="avatar-file-input"
        onChange={(event) => onChange?.({ file: event.target.files?.[0] })}
      />
    </div>
  );
  return {
    ...actual,
    Upload,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: messageMock }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => localeMocks,
}));

vi.mock("../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: headerMocks.setHeaderSlot }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../components/HeaderActionButton", () => ({
  default: ({ onClick, "aria-label": ariaLabel }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {ariaLabel ?? "action"}
    </button>
  ),
}));

vi.mock("../components/ConfirmDeleteButton", () => ({
  default: ({ onConfirm, deleteLabel }) => (
    <button type="button" onClick={onConfirm}>
      {deleteLabel}
    </button>
  ),
}));

vi.mock("../components/NeuFormControl", () => {
  const NeuInput = (props) => <input {...props} />;
  NeuInput.Password = (props) => <input type="password" {...props} />;
  return {
    NeuInput,
    NeuSelect: ({ children, ...props }) => <select {...props}>{children}</select>,
  };
});

vi.mock("../components/PageLoader", () => ({
  default: ({ variant }) => <div data-testid={`page-loader-${variant}`} />,
}));

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

import { updateProfile, updateLocale, updatePassword, sendCode, updateIdentifier, uploadAvatar } from "../utils";

const sampleProfile = {
  display_name: "Alice",
  email: "alice@example.com",
  avatar_url: null,
  phone: null,
  preferred_locale: "en-US",
  wechat_bound: false,
};

describe("ProfilePage", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
    headerMocks.slot = null;
    headerMocks.setHeaderSlot.mockClear();
  });

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

  test("shows profile loader when profile is missing", () => {
    render(
      <ProfilePage
        profile={null}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByTestId("page-loader-profile")).toBeInTheDocument();
  });

  test("uploads avatar successfully", async () => {
    vi.mocked(uploadAvatar).mockResolvedValue({
      ...sampleProfile,
      avatar_url: "avatars/alice.png",
    });
    const onProfileChange = vi.fn();
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={onProfileChange}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.upload(screen.getByTestId("avatar-file-input"), file);

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalled();
      expect(messageMock.success).toHaveBeenCalledWith("avatarUpdated");
      expect(onProfileChange).toHaveBeenCalled();
    });
  });

  test("shows error when avatar upload fails", async () => {
    vi.mocked(uploadAvatar).mockRejectedValue(new Error("network"));
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.upload(screen.getByTestId("avatar-file-input"), file);

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("network");
    });
  });

  test("saves updated display name", async () => {
    vi.mocked(updateProfile).mockResolvedValue({
      ...sampleProfile,
      display_name: "Alice Chen",
    });
    const onProfileChange = vi.fn();

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={onProfileChange}
        onLogout={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("displayName");
    await userEvent.clear(input);
    await userEvent.type(input, "Alice Chen");
    await userEvent.click(screen.getByText("saveDisplayName"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({ displayName: "Alice Chen" });
      expect(messageMock.success).toHaveBeenCalledWith("displayNameUpdated");
      expect(onProfileChange).toHaveBeenCalled();
    });
  });

  test("saves preferred locale", async () => {
    vi.mocked(updateLocale).mockResolvedValue({
      ...sampleProfile,
      preferred_locale: "zh-CN",
    });
    const onProfileChange = vi.fn();

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={onProfileChange}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByLabelText("localeChinese"));
    await userEvent.click(screen.getByText("saveLanguage"));

    await waitFor(() => {
      expect(updateLocale).toHaveBeenCalledWith("zh-CN");
      expect(messageMock.success).toHaveBeenCalledWith("languageUpdated");
      expect(onProfileChange).toHaveBeenCalled();
    });
  });

  test("calls logout handler from header action", async () => {
    const onLogout = vi.fn();
    const headerHost = document.createElement("div");
    document.body.appendChild(headerHost);

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={onLogout}
      />,
    );

    expect(headerMocks.slot).toBeTruthy();
    render(headerMocks.slot, { container: headerHost });

    await userEvent.click(screen.getByText("logout"));
    expect(onLogout).toHaveBeenCalled();

    headerHost.remove();
  });

  test("updates password", async () => {
    vi.mocked(updatePassword).mockResolvedValue(undefined);

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("currentPassword"), "old-pass");
    await userEvent.type(screen.getByPlaceholderText("newPassword"), "new-pass");
    await userEvent.type(screen.getByPlaceholderText("confirmPassword"), "new-pass");
    await userEvent.click(screen.getByText("updatePassword"));

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith({
        currentPassword: "old-pass",
        newPassword: "new-pass",
      });
      expect(messageMock.success).toHaveBeenCalledWith("passwordUpdated");
    });
  });

  test("sends email verification code", async () => {
    vi.mocked(sendCode).mockResolvedValue(undefined);

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.clear(screen.getByPlaceholderText("emailAddress"));
    await userEvent.type(screen.getByPlaceholderText("emailAddress"), "new@example.com");
    await userEvent.click(screen.getByText("sendCode"));

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith("new@example.com", "EMAIL");
      expect(messageMock.success).toHaveBeenCalledWith("codeSent");
    });
  });

  test("updates email with verification code", async () => {
    vi.mocked(updateIdentifier).mockResolvedValue({
      ...sampleProfile,
      email: "new@example.com",
    });
    const onProfileChange = vi.fn();

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={onProfileChange}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.clear(screen.getByPlaceholderText("emailAddress"));
    await userEvent.type(screen.getByPlaceholderText("emailAddress"), "new@example.com");
    await userEvent.type(screen.getByPlaceholderText("verificationCode"), "123456");
    await userEvent.click(screen.getByText("updateEmail"));

    await waitFor(() => {
      expect(updateIdentifier).toHaveBeenCalledWith({
        type: "email",
        identifier: "new@example.com",
        code: "123456",
      });
      expect(messageMock.success).toHaveBeenCalledWith("emailUpdated");
      expect(onProfileChange).toHaveBeenCalled();
    });
  });

  test("shows error when display name update fails", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error("server error"));

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("saveDisplayName"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("server error");
    });
  });

  test("shows error when password update fails", async () => {
    vi.mocked(updatePassword).mockRejectedValue(new Error("wrong password"));

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("currentPassword"), "old-pass");
    await userEvent.type(screen.getByPlaceholderText("newPassword"), "new-pass");
    await userEvent.type(screen.getByPlaceholderText("confirmPassword"), "new-pass");
    await userEvent.click(screen.getByText("updatePassword"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("wrong password");
    });
  });

  test("shows error when locale update fails", async () => {
    vi.mocked(updateLocale).mockRejectedValue(new Error("locale failed"));

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("saveLanguage"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("locale failed");
    });
  });

  test("shows error when send code fails", async () => {
    vi.mocked(sendCode).mockRejectedValue(new Error("rate limited"));

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.clear(screen.getByPlaceholderText("emailAddress"));
    await userEvent.type(screen.getByPlaceholderText("emailAddress"), "new@example.com");
    await userEvent.click(screen.getByText("sendCode"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("rate limited");
    });
  });

  test("shows error when email update fails", async () => {
    vi.mocked(updateIdentifier).mockRejectedValue(new Error("invalid code"));

    render(
      <ProfilePage
        profile={sampleProfile}
        onProfileChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await userEvent.clear(screen.getByPlaceholderText("emailAddress"));
    await userEvent.type(screen.getByPlaceholderText("emailAddress"), "new@example.com");
    await userEvent.type(screen.getByPlaceholderText("verificationCode"), "000000");
    await userEvent.click(screen.getByText("updateEmail"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("invalid code");
    });
  });
});
