import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GroupObjectDetailPage from "./GroupObjectDetailPage";
import { deleteUserObject, getGroupById, getUserObjectById } from "../utils/groupsApi";
import { getBrandObjectById } from "../utils/brandsApi";

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
    Form: Object.assign(actual.Form, {
      useForm: () => [vi.fn()],
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
      deleteModel
    </button>
  ),
}));

vi.mock("../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("../hooks/useRemoteModelSelectSearch", () => ({
  default: () => ({
    results: [],
    loading: false,
    onSearch: vi.fn(),
    setResults: vi.fn(),
  }),
}));

vi.mock("../components/DetailImage", () => ({
  default: ({ alt }) => <img alt={alt} />,
}));

vi.mock("../components/ObjectDetailPageSkeleton", () => ({
  default: ({ showRelatedModel }) => (
    <div data-testid={showRelatedModel ? "detail-skeleton-related" : "detail-skeleton"} />
  ),
}));

vi.mock("../components/RelatedModelCard", () => ({
  default: ({ brandObject }) => (
    <div data-testid="related-model">{brandObject.name}</div>
  ),
}));

vi.mock("../components/RelatedModelCardSkeleton", () => ({
  default: () => <div data-testid="related-skeleton" />,
}));

vi.mock("../utils/groupsApi", () => ({
  getGroupById: vi.fn(),
  getUserObjectById: vi.fn(),
  updateUserObject: vi.fn(),
  deleteUserObject: vi.fn(),
}));

vi.mock("../utils/brandsApi", () => ({
  getBrandObjectById: vi.fn(),
}));

const sampleUserObject = {
  id: 10,
  name: "My M3",
  image_url: null,
  other_notes: "Mint condition",
  brand_object_id: 42,
};

function renderPage(state = { userObject: sampleUserObject, group: { id: 5, name: "Garage" } }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/groups/5/objects/10", state }]}>
      <Routes>
        <Route path="/groups/:groupId/objects/:objectId" element={<GroupObjectDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GroupObjectDetailPage", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
    headerMocks.slot = null;
    headerMocks.setHeaderSlot.mockClear();
    navigateMock.mockReset();
    vi.mocked(getGroupById).mockReset();
    vi.mocked(getUserObjectById).mockReset();
    vi.mocked(getBrandObjectById).mockReset();
    vi.mocked(deleteUserObject).mockReset();
    vi.mocked(getUserObjectById).mockResolvedValue(sampleUserObject);
    vi.mocked(getBrandObjectById).mockResolvedValue({ id: 42, name: "BMW M3", brand_id: 9 });
    vi.mocked(deleteUserObject).mockResolvedValue(undefined);
  });

  test("renders user object notes from route state", async () => {
    renderPage();

    expect(screen.getByAltText("My M3")).toBeInTheDocument();
    expect(screen.getByText("Mint condition")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("related-model")).toHaveTextContent("BMW M3");
    });
  });

  test("shows skeleton while loading without prefetched data", () => {
    renderPage({ userObject: null, group: { id: 5, name: "Garage" } });

    expect(screen.getByTestId("detail-skeleton-related")).toBeInTheDocument();
  });

  test("loads user object from API when route state is missing", async () => {
    vi.mocked(getUserObjectById).mockResolvedValue({
      id: 10,
      name: "Loaded M3",
      other_notes: "Fresh from API",
      brand_object_id: null,
    });

    renderPage({ userObject: null, group: { id: 5, name: "Garage" } });

    await waitFor(() => {
      expect(getUserObjectById).toHaveBeenCalledWith("5", "10");
      expect(screen.getByText("Fresh from API")).toBeInTheDocument();
    });
  });

  test("refreshes stale route state so related model appears after edit", async () => {
    vi.mocked(getUserObjectById).mockResolvedValue({
      id: 10,
      name: "My M3",
      other_notes: "Mint condition",
      brand_object_id: 42,
    });

    renderPage({
      userObject: {
        id: 10,
        name: "My M3",
        other_notes: "Mint condition",
        brand_object_id: null,
      },
      group: { id: 5, name: "Garage" },
    });

    await waitFor(() => {
      expect(getUserObjectById).toHaveBeenCalledWith("5", "10");
      expect(screen.getByTestId("related-model")).toHaveTextContent("BMW M3");
    });
  });

  test("shows error when user object fetch fails", async () => {
    vi.mocked(getUserObjectById).mockRejectedValue(new Error("forbidden"));

    renderPage({ userObject: null, group: { id: 5, name: "Garage" } });

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("forbidden");
    });
  });

  test("deletes model from header action", async () => {
    const headerHost = document.createElement("div");
    document.body.appendChild(headerHost);

    renderPage();

    await waitFor(() => expect(headerMocks.slot).toBeTruthy());
    render(headerMocks.slot, { container: headerHost });

    await userEvent.click(screen.getByText("deleteModel"));

    await waitFor(() => {
      expect(deleteUserObject).toHaveBeenCalledWith("5", 10);
      expect(messageMock.success).toHaveBeenCalledWith("modelDeleted");
      expect(navigateMock).toHaveBeenCalled();
    });

    headerHost.remove();
  });

  test("shows error when delete fails", async () => {
    vi.mocked(deleteUserObject).mockRejectedValue(new Error("delete failed"));
    const headerHost = document.createElement("div");
    document.body.appendChild(headerHost);

    renderPage();

    await waitFor(() => expect(headerMocks.slot).toBeTruthy());
    render(headerMocks.slot, { container: headerHost });

    await userEvent.click(screen.getByText("deleteModel"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("delete failed");
    });

    headerHost.remove();
  });

  test("shows error when group fetch fails", async () => {
    vi.mocked(getGroupById).mockRejectedValue(new Error("group denied"));

    renderPage({ userObject: sampleUserObject, group: null });

    await waitFor(() => {
      expect(getGroupById).toHaveBeenCalledWith("5");
      expect(messageMock.error).toHaveBeenCalledWith("group denied");
    });
  });
});
