import { act, render, renderHook, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useGroupsState from "./useGroupsState";

const mockNavigate = vi.fn();
const mockSetHeaderSlot = vi.fn();
const mockMessageSuccess = vi.fn();
const mockMessageError = vi.fn();
const mockRefreshAll = vi.fn().mockResolvedValue(undefined);
const mockGroupsBrowse = {
  displayItems: [{ id: 1, name: "Favorites" }],
  loading: false,
  orderLoading: false,
  hasMore: false,
  loadingMore: false,
  loadMore: vi.fn(),
  orderedIds: [1],
  sortEnabled: true,
  refreshAll: mockRefreshAll,
  handleDragEnd: vi.fn(),
};

vi.mock("../../hooks/useOrderableInfiniteBrowse", () => ({
  default: () => mockGroupsBrowse,
}));

const mockCreateGroup = vi.fn();
const mockValidateFields = vi.fn();

let mockSearchValue = "";
let mockPathname = "/groups";

const mockCombinedSearch = {
  brands: [{ id: 2 }],
  objects: [{ id: 3 }],
  loading: false,
  loadPage: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockPathname,
      search: mockSearchValue ? `?q=${encodeURIComponent(mockSearchValue)}` : "",
    }),
  };
});

vi.mock("../../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: mockSetHeaderSlot }),
}));

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({
    t: (key) => key,
  }),
}));

vi.mock("antd", () => ({
  App: {
    useApp: () => ({
      message: {
        success: mockMessageSuccess,
        error: mockMessageError,
      },
    }),
  },
  Form: {
    useForm: () => [
      {
        validateFields: mockValidateFields,
        resetFields: vi.fn(),
      },
    ],
  },
}));

vi.mock("../../hooks/useCombinedBrandSearch", () => ({
  default: () => mockCombinedSearch,
}));

vi.mock("../../utils/groupsApi", () => ({
  createGroup: (...args) => mockCreateGroup(...args),
  getGroupsPage: vi.fn(),
  getGroupOrder: vi.fn(),
  reorderGroups: vi.fn(),
  searchGroupsCombinedPage: vi.fn(),
}));

vi.mock("../pageHeaders/GroupObjectsPageHeader", () => ({
  default: () => null,
}));

function GroupsProbe() {
  const state = useGroupsState();
  return (
    <div>
      <span data-testid="search">{state.searchValue}</span>
      <button type="button" onClick={() => state.handleGroupSearch("kyosho")}>
        search
      </button>
      <button type="button" onClick={() => state.handleGroupClick({ id: 7, name: "Mine" })}>
        open
      </button>
      <button type="button" onClick={() => state.handleCreateGroup()}>
        create
      </button>
    </div>
  );
}

describe("useGroupsState", () => {
  beforeEach(() => {
    mockSearchValue = "";
    mockPathname = "/groups";
    vi.clearAllMocks();
    mockValidateFields.mockResolvedValue({ name: "New Group" });
    mockCreateGroup.mockResolvedValue({ id: 99 });
  });

  test("exposes browse list on groups tab", () => {
    const { result } = renderHook(() => useGroupsState(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={["/groups"]}>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      ),
    });

    expect(result.current.groups).toEqual([{ id: 1, name: "Favorites" }]);
    expect(result.current.groupSearchActive).toBe(false);
  });

  test("handleGroupSearch updates q param", async () => {
    render(
      <MemoryRouter initialEntries={["/groups"]}>
        <Routes>
          <Route path="*" element={<GroupsProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "search" }));
    await waitFor(() => {
      expect(screen.getByTestId("search")).toHaveTextContent("kyosho");
    });
  });

  test("handleGroupClick navigates to group detail", async () => {
    render(
      <MemoryRouter initialEntries={["/groups?q=test"]}>
        <Routes>
          <Route path="*" element={<GroupsProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "open" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/groups/7" }),
      expect.any(Object),
    );
  });

  test("handleCreateGroup creates group and refreshes list", async () => {
    render(
      <MemoryRouter initialEntries={["/groups"]}>
        <Routes>
          <Route path="*" element={<GroupsProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: "New Group",
        image_url: null,
      });
    });
    expect(mockMessageSuccess).toHaveBeenCalledWith("groupCreated");
    expect(mockRefreshAll).toHaveBeenCalled();
  });
});
