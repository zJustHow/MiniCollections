import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BrandObjectDetailPage from "./BrandObjectDetailPage";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
    Grid: {
      useBreakpoint: () => ({ md: true }),
    },
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en-US" }),
}));

vi.mock("../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: vi.fn() }),
}));

vi.mock("../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("../components/DetailImage", () => ({
  default: ({ alt }) => <img alt={alt} />,
}));

vi.mock("../components/ObjectDetailPageSkeleton", () => ({
  default: () => <div data-testid="detail-skeleton" />,
}));

vi.mock("../utils/brandsApi", () => ({
  getBrandObjectById: vi.fn(),
  recordModelView: vi.fn(),
}));

vi.mock("../utils/groupsApi", () => ({
  getGroupsPage: vi.fn(async () => ({ content: [] })),
  createUserObject: vi.fn(),
}));

const sampleBrandObject = {
  id: 42,
  name: "BMW M3",
  brand: "BMW",
  image_url: null,
  view_count: 120,
};

function renderPage(state = { brandObject: sampleBrandObject }) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/brands/9/objects/42", state },
      ]}
    >
      <Routes>
        <Route
          path="/brands/:brandId/objects/:objectId"
          element={<BrandObjectDetailPage authed />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BrandObjectDetailPage", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => "1"),
      setItem: vi.fn(),
    });
  });

  test("renders model name and add-to-group action from route state", () => {
    renderPage();

    expect(screen.getByAltText("BMW M3")).toBeInTheDocument();
    expect(screen.getByText("addToGroup")).toBeInTheDocument();
    expect(screen.getByText("BMW")).toBeInTheDocument();
  });

  test("shows skeleton while loading without prefetched data", () => {
    renderPage({ brandObject: { id: 42, name: "BMW M3" } });

    expect(screen.getByTestId("detail-skeleton")).toBeInTheDocument();
  });
});
