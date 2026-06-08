import { render, screen, waitFor } from "@testing-library/react";
import { LocaleProvider, useLocale } from "./LocaleContext";
import { translations } from "./i18n";

vi.mock("./theme/fontScale", () => ({
  useNeuFontScale: () => 1,
  buildAntdFontTokens: () => ({}),
}));

vi.mock("./components/NeuFormControl", () => ({
  neuFormControlTheme: { token: {}, components: {} },
}));

vi.mock("./components/SplashLoader", () => ({
  default: () => <div data-testid="splash">loading</div>,
}));

function LocaleProbe() {
  const { locale, t, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="label">{t("brands")}</span>
      <span data-testid="named">{t("welcomeUser", { name: "Ada" })}</span>
      <button type="button" onClick={() => setLocale("zh-CN")}>
        switch-zh
      </button>
    </div>
  );
}

describe("LocaleContext", () => {
  beforeEach(() => {
    translations["en-US"] = translations["en-US"] ?? { brands: "Brands" };
    translations["en-US"].welcomeUser = "Hello, {name}!";
    delete translations["zh-CN"];
    vi.stubGlobal("navigator", { language: "en-US" });
  });

  test("t interpolates named placeholders", async () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("label")).toHaveTextContent("Brands");
    });
    expect(screen.getByTestId("named")).toHaveTextContent("Hello, Ada!");
  });

  test("setLocale loads zh dictionary", async () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });

    await screen.findByTestId("locale");
    await import("@testing-library/user-event").then(({ default: userEvent }) =>
      userEvent.click(screen.getByRole("button", { name: "switch-zh" })),
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("zh-CN");
    });
    expect(translations["zh-CN"]).toBeTruthy();
  });
});
