import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BrandObjectDetailPage from "./BrandObjectDetailPage";
import { getBrandObjectById, recordModelView } from "../utils/brandsApi";

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const headerMocks = vi.hoisted(() => ({
  slot: null,
  setHeaderSlot: vi.fn((node) => {
    headerMocks.slot = node;
  }),
}));

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: messageMock }),
    }),
    Grid: {
      useBreakpoint: () => ({ md: true }),
    },
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key, args) => (key === "viewsCount" ? `${args.count} views` : key), locale: "en-US" }),
}));

vi.mock("../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: headerMocks.setHeaderSlot }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
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
  default: ({ onConfirm }) => (
    <button type="button" onClick={onConfirm}>
      deleteBrandObject
    </button>
  ),
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

vi.mock("../utils/adminApi", () => ({
  adminDeleteBrandObject: vi.fn(),
}));

import { adminDeleteBrandObject } from "../utils/adminApi";

const sampleBrandObject = {
  id: 42,
  name: "BMW M3",
  brand: "BMW",
  image_url: null,
  view_count: 120,
};

function renderPage(state = { brandObject: sampleBrandObject }, props = { authed: true }) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/brands/9/objects/42", state },
      ]}
    >
      <Routes>
        <Route
          path="/brands/:brandId/objects/:objectId"
          element={<BrandObjectDetailPage {...props} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BrandObjectDetailPage", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
    headerMocks.slot = null;
    headerMocks.setHeaderSlot.mockClear();
    navigateMock.mockReset();
    vi.mocked(getBrandObjectById).mockReset();
    vi.mocked(recordModelView).mockReset();
    vi.mocked(recordModelView).mockResolvedValue(undefined);
    vi.mocked(adminDeleteBrandObject).mockReset();
    vi.mocked(adminDeleteBrandObject).mockResolvedValue(undefined);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
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

  test("renders immediately when brand is passed separately in route state", () => {
    renderPage({
      brandObject: { id: 42, name: "BMW M3", image_url: null },
      brand: { name_en: "BMW" },
    });

    expect(screen.queryByTestId("detail-skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("BMW")).toBeInTheDocument();
    expect(screen.getByText("addToGroup")).toBeInTheDocument();
  });

  test("loads model details from API when route state is incomplete", async () => {
    vi.mocked(getBrandObjectById).mockResolvedValue({
      id: 42,
      name: "BMW M3",
      brand: "BMW",
      series: "M Series",
      view_count: 88,
    });

    renderPage({ brandObject: { id: 42, name: "BMW M3" } });

    await waitFor(() => {
      expect(getBrandObjectById).toHaveBeenCalledWith("42");
      expect(screen.getByText("M Series")).toBeInTheDocument();
      expect(screen.getByText("88 views")).toBeInTheDocument();
    });
  });

  test("shows error when model fetch fails", async () => {
    vi.mocked(getBrandObjectById).mockRejectedValue(new Error("not found"));

    renderPage({ brandObject: { id: 42, name: "BMW M3" } });

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("not found");
    });
  });

  test("records model view once per session", async () => {
    renderPage();

    await waitFor(() => {
      expect(recordModelView).toHaveBeenCalledWith("42");
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("viewed:model:42", "1");
  });

  test("admin deletes brand object from header action", async () => {
    const headerHost = document.createElement("div");
    document.body.appendChild(headerHost);

    renderPage({ brandObject: sampleBrandObject }, { isAdmin: true, authed: true });

    await waitFor(() => expect(headerMocks.slot).toBeTruthy());
    render(headerMocks.slot, { container: headerHost });

    await userEvent.click(screen.getByText("deleteBrandObject"));

    await waitFor(() => {
      expect(adminDeleteBrandObject).toHaveBeenCalledWith(42);
      expect(messageMock.success).toHaveBeenCalledWith("brandObjectDeleted");
      expect(navigateMock).toHaveBeenCalledWith("/brands/9");
    });

    headerHost.remove();
  });

  test("shows error when admin delete fails", async () => {
    vi.mocked(adminDeleteBrandObject).mockRejectedValue(new Error("forbidden"));
    const headerHost = document.createElement("div");
    document.body.appendChild(headerHost);

    renderPage({ brandObject: sampleBrandObject }, { isAdmin: true, authed: true });

    await waitFor(() => expect(headerMocks.slot).toBeTruthy());
    render(headerMocks.slot, { container: headerHost });

    await userEvent.click(screen.getByText("deleteBrandObject"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("forbidden");
    });

    headerHost.remove();
  });

  test("does not record model view in admin mode", async () => {
    renderPage({ brandObject: sampleBrandObject }, { isAdmin: true, authed: true });

    await waitFor(() => {
      expect(recordModelView).not.toHaveBeenCalled();
    });
  });
});
