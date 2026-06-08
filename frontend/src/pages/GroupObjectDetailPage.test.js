import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GroupObjectDetailPage from "./GroupObjectDetailPage";

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
  default: () => <div data-testid="detail-skeleton" />,
}));

vi.mock("../components/RelatedModelCard", () => ({
  default: ({ name }) => <div data-testid="related-model">{name}</div>,
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
  getBrandObjectById: vi.fn(async () => ({ id: 42, name: "BMW M3" })),
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
    <MemoryRouter
      initialEntries={[{ pathname: "/groups/5/objects/10", state }]}
    >
      <Routes>
        <Route
          path="/groups/:groupId/objects/:objectId"
          element={<GroupObjectDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GroupObjectDetailPage", () => {
  test("renders user object notes from route state", () => {
    renderPage();

    expect(screen.getByAltText("My M3")).toBeInTheDocument();
    expect(screen.getByText("Mint condition")).toBeInTheDocument();
  });

  test("shows skeleton while loading without prefetched data", () => {
    renderPage({ userObject: null, group: { id: 5, name: "Garage" } });

    expect(screen.getByTestId("detail-skeleton")).toBeInTheDocument();
  });
});
