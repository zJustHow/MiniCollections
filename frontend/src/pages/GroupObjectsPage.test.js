import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GroupObjectsPage from "./GroupObjectsPage";

const pageMocks = vi.hoisted(() => ({
  searchActive: false,
  searchKeyword: "",
  draftQuery: "",
  displayItems: [{ id: 10, name: "My M3", image_url: null }],
  loading: false,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
    Form: Object.assign(actual.Form, {
      useForm: () => [vi.fn()],
    }),
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

vi.mock("../utils/scroll", () => ({
  scrollAppToTop: vi.fn(),
}));

vi.mock("../utils/groupsApi", () => ({
  getGroupById: vi.fn(),
  getUserObjectsPage: vi.fn(),
  searchGroupObjectsPage: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  createUserObject: vi.fn(),
}));

vi.mock("../hooks/useSearchParam", () => ({
  default: () => ["", vi.fn()],
}));

vi.mock("../hooks/useReturnSearchRef", () => ({
  default: () => ({ current: "" }),
}));

vi.mock("../hooks/useObjectListPageSearch", () => ({
  default: () => ({
    searchActive: pageMocks.searchActive,
    searchKeyword: pageMocks.searchKeyword,
    draftQuery: pageMocks.draftQuery,
    runSearch: vi.fn(),
    handleDraftChange: vi.fn(),
  }),
}));

vi.mock("../hooks/useDualModeBrowseList", () => ({
  default: () => ({
    browseList: {
      loading: pageMocks.loading,
      orderLoading: false,
      hasMore: false,
      loadingMore: false,
      loadMore: vi.fn(),
      orderedIds: [10],
      sortEnabled: true,
      refreshAll: vi.fn(),
      handleDragEnd: vi.fn(),
    },
    searchList: { page: 0, loading: pageMocks.loading, loadPage: vi.fn() },
    displayItems: pageMocks.displayItems,
  }),
}));

vi.mock("../hooks/useRemoteModelSelectSearch", () => ({
  default: () => ({
    results: [],
    loading: false,
    onSearch: vi.fn(),
    setResults: vi.fn(),
  }),
}));

vi.mock("../components/pageHeaders/GroupObjectsPageHeader", () => ({
  default: ({ group }) => <div data-testid="group-header">{group?.name}</div>,
}));

vi.mock("../components/listPage/ObjectListPageShell", () => ({
  default: ({ children, searchPlaceholder }) => (
    <div data-testid="object-list-shell">
      <span>{searchPlaceholder}</span>
      {children}
    </div>
  ),
}));

vi.mock("../components/listPage/SortableInfiniteBrowseSection", () => ({
  default: ({ items, renderItem, loading, orderLoading }) =>
    loading || orderLoading ? (
      <div data-testid="browse-loading" />
    ) : (
      <div data-testid="browse-grid">{items.map((item) => renderItem(item))}</div>
    ),
}));

vi.mock("../components/listPage/SortableNeuCard", () => ({
  default: ({ name, onClick, add }) => (
    <button type="button" onClick={onClick}>
      {add ? "addModel" : name}
    </button>
  ),
}));

vi.mock("../components/listPage/ObjectBrowseSection", () => ({
  default: ({ children, loading }) =>
    loading ? <div data-testid="browse-loading" /> : <div>{children}</div>,
}));

vi.mock("../components/listPage/NoSearchResults", () => ({
  default: () => <div data-testid="no-results" />,
}));

vi.mock("../components/listPage/ActivePagePagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

const sampleGroup = { id: 5, name: "Garage" };

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/groups/5", state: { group: sampleGroup } },
      ]}
    >
      <Routes>
        <Route path="/groups/:groupId" element={<GroupObjectsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GroupObjectsPage", () => {
  beforeEach(() => {
    pageMocks.searchActive = false;
    pageMocks.searchKeyword = "";
    pageMocks.draftQuery = "";
    pageMocks.displayItems = [{ id: 10, name: "My M3", image_url: null }];
    pageMocks.loading = false;
  });

  test("renders group models and add card on first page", () => {
    renderPage();

    expect(screen.getByTestId("object-list-shell")).toBeInTheDocument();
    expect(screen.getByText("searchModels")).toBeInTheDocument();
    expect(screen.getByText("My M3")).toBeInTheDocument();
    expect(screen.getByText("addModel")).toBeInTheDocument();
  });

  test("renders search hits when search is active", () => {
    pageMocks.searchActive = true;
    pageMocks.searchKeyword = "m3";
    pageMocks.displayItems = [{ id: 11, name: "M3 Search Hit", image_url: null }];

    renderPage();

    expect(screen.getByText("M3 Search Hit")).toBeInTheDocument();
    expect(screen.queryByText("addModel")).not.toBeInTheDocument();
  });

  test("shows no-results state for empty search", () => {
    pageMocks.searchActive = true;
    pageMocks.searchKeyword = "missing";
    pageMocks.displayItems = [];

    renderPage();

    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
