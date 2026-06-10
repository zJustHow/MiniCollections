import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupsTab from "./GroupsTab";

const mockNavigate = vi.fn();
const mockOnGroupClick = vi.fn();
const mockOnCreateGroup = vi.fn();
const mockOnGroupReorder = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../hooks/useTabListSearchField", () => ({
  default: () => ({
    draftQuery: "",
    handleDraftChange: vi.fn(),
  }),
}));

vi.mock("../listPage/ObjectListPageShell", () => ({
  default: ({ children }) => <div data-testid="shell">{children}</div>,
}));

vi.mock("../listPage/SortableInfiniteBrowseSection", () => ({
  default: ({ items, renderItem, loading, orderLoading, onDragEnd }) =>
    loading || orderLoading ? (
      <div data-testid="browse-loading" />
    ) : (
      <div data-testid="browse-body">
        {items.map((item) => renderItem(item))}
        <button
          type="button"
          data-testid="trigger-reorder"
          onClick={() => onDragEnd?.(1, 2)}
        >
          drag
        </button>
      </div>
    ),
}));

vi.mock("../listPage/NoSearchResults", () => ({
  default: () => <div data-testid="no-results" />,
}));

vi.mock("../../utils/prefetchRoutes", () => ({
  prefetchGroupObjectDetailPage: vi.fn(),
}));

vi.mock("../listPage/TabCombinedSearchSection", () => ({
  default: ({ primaryCards, objectCards }) => (
    <div data-testid="combined">
      {primaryCards}
      {objectCards}
    </div>
  ),
}));

vi.mock("../listPage/SortableNeuCard", () => ({
  default: ({ name, onClick, add }) => (
    <button type="button" onClick={onClick}>
      {add ? "add-card" : name}
    </button>
  ),
}));

const baseProps = {
  groups: [{ id: 1, name: "Favorites", image_url: null }],
  onSearch: vi.fn(),
  onGroupClick: mockOnGroupClick,
  onCreateGroup: mockOnCreateGroup,
  onGroupReorder: mockOnGroupReorder,
  searchValue: "",
  searchActive: false,
  searchResultGroups: [],
  searchResultObjects: [],
  groupsBrowse: {
    loading: false,
    orderLoading: false,
    hasMore: false,
    orderedIds: [1],
    sortEnabled: true,
  },
  combinedSearchPage: { loading: false, totalBrands: 0, totalObjects: 0 },
};

describe("GroupsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders browse groups with add card", () => {
    render(<GroupsTab {...baseProps} />);

    expect(screen.getByTestId("browse-body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "add-card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Favorites" })).toBeInTheDocument();
  });

  test("handles group click", async () => {
    render(<GroupsTab {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Favorites" }));
    expect(mockOnGroupClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: "Favorites" }),
    );
  });

  test("renders combined search sections when active", () => {
    render(
      <GroupsTab
        {...baseProps}
        searchActive
        searchValue="kyosho"
        searchResultGroups={[{ id: 2, name: "Cars", image_url: null }]}
        searchResultObjects={[
          {
            id: 9,
            name: "Model",
            group_id: 2,
            group_name: "Cars",
            image_url: null,
          },
        ]}
        combinedSearchPage={{
          loading: false,
          totalBrands: 1,
          totalObjects: 1,
        }}
      />,
    );

    expect(screen.getByTestId("combined")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cars" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Model" })).toBeInTheDocument();
  });

  test("shows browse loading while order is loading", () => {
    render(
      <GroupsTab
        {...baseProps}
        groupsBrowse={{
          ...baseProps.groupsBrowse,
          orderLoading: true,
        }}
      />,
    );

    expect(screen.getByTestId("browse-loading")).toBeInTheDocument();
    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
  });

  test("forwards group reorder drag events", async () => {
    render(<GroupsTab {...baseProps} />);

    await userEvent.click(screen.getByTestId("trigger-reorder"));
    expect(mockOnGroupReorder).toHaveBeenCalledWith(1, 2);
  });

  test("navigates to object detail from search results", async () => {
    render(
      <GroupsTab
        {...baseProps}
        searchActive
        searchValue="bmw"
        searchResultObjects={[
          {
            id: 9,
            name: "M3",
            group_id: 2,
            group_name: "Cars",
            image_url: null,
          },
        ]}
        combinedSearchPage={{
          loading: false,
          totalBrands: 0,
          totalObjects: 1,
        }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "M3" }));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/groups/2/objects/9",
      expect.objectContaining({
        state: expect.objectContaining({
          userObject: expect.objectContaining({ id: 9, name: "M3" }),
        }),
      }),
    );
  });

  test("shows no-results state for empty search", () => {
    render(
      <GroupsTab
        {...baseProps}
        searchActive
        searchValue="missing"
        combinedSearchPage={{
          loading: false,
          totalBrands: 0,
          totalObjects: 0,
        }}
      />,
    );

    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
