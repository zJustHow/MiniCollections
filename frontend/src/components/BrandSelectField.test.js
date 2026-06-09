import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrandSelectField, { OTHER_BRAND } from "./BrandSelectField";

const remoteBrandMocks = vi.hoisted(() => ({
  options: [{ id: 1, name: "Mini GT" }],
  loading: false,
  onSearch: vi.fn(),
  ensureBrand: vi.fn(),
  seedBrand: vi.fn(),
}));

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../hooks/useRemoteBrandSelect", () => ({
  default: () => remoteBrandMocks,
}));

vi.mock("./NeuFormControl", () => {
  const NeuSelect = ({ children, onChange, value, onSearch, loading }) => (
    <div data-testid="brand-select" data-loading={String(loading)}>
      <input
        data-testid="brand-search"
        onChange={(event) => onSearch?.(event.target.value)}
      />
      <select
        aria-label="brand"
        value={value ?? ""}
        onChange={(event) => onChange?.(Number(event.target.value))}
      >
        {children}
      </select>
    </div>
  );
  NeuSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );
  return { NeuSelect };
});

describe("BrandSelectField", () => {
  beforeEach(() => {
    remoteBrandMocks.options = [{ id: 1, name: "Mini GT" }];
    remoteBrandMocks.loading = false;
    remoteBrandMocks.onSearch.mockReset();
    remoteBrandMocks.ensureBrand.mockReset();
    remoteBrandMocks.seedBrand.mockReset();
  });

  test("renders remote brand options", () => {
    render(<BrandSelectField value={1} onChange={vi.fn()} />);

    expect(screen.getByText("Mini GT")).toBeInTheDocument();
    expect(screen.getByTestId("brand-select")).toHaveAttribute("data-loading", "false");
  });

  test("includes other brand option when enabled", () => {
    render(<BrandSelectField includeOther onChange={vi.fn()} />);

    expect(screen.getByText("brandOther")).toBeInTheDocument();
  });

  test("seeds brand on mount and searches remotely", async () => {
    render(
      <BrandSelectField
        seedBrand={{ id: 9, name_en: "Kyosho" }}
        onChange={vi.fn()}
      />,
    );

    expect(remoteBrandMocks.seedBrand).toHaveBeenCalledWith({ id: 9, name_en: "Kyosho" });

    await userEvent.type(screen.getByTestId("brand-search"), "bmw");
    expect(remoteBrandMocks.onSearch).toHaveBeenCalledWith("bmw");
  });

  test("ensures selected brand is loaded", async () => {
    render(<BrandSelectField value={5} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(remoteBrandMocks.ensureBrand).toHaveBeenCalledWith(5);
    });
  });

  test("does not ensure brand for other option", async () => {
    render(<BrandSelectField value={OTHER_BRAND} onChange={vi.fn()} includeOther />);

    await waitFor(() => {
      expect(remoteBrandMocks.ensureBrand).not.toHaveBeenCalled();
    });
  });
});
