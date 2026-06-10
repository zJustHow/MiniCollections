import { render, screen } from "@testing-library/react";
import TabListPageBody from "./TabListPageBody";

vi.mock("./NoSearchResults", () => ({
  default: () => <div data-testid="no-results" />,
}));

vi.mock("./ObjectBrowseSection", () => ({
  default: ({ loading, children }) =>
    loading ? <div data-testid="browse-loading" /> : <div>{children}</div>,
}));

vi.mock("./ActivePagePagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

describe("TabListPageBody", () => {
  test("renders browse items when not loading", () => {
    render(
      <TabListPageBody
        searchActive={false}
        spinning={false}
        browseItems={[{ id: 1, name: "Kyosho" }]}
        renderBrowseItem={(item) => <div key={item.id}>{item.name}</div>}
        browsePaginationPage={{ page: 0 }}
        searchPaginationPage={{ page: 0 }}
      />,
    );

    expect(screen.getByText("Kyosho")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  test("shows browse loading skeleton", () => {
    render(
      <TabListPageBody
        searchActive={false}
        spinning
        browseItems={[{ id: 1, name: "Kyosho" }]}
        renderBrowseItem={(item) => <div key={item.id}>{item.name}</div>}
        browsePaginationPage={{ page: 0 }}
        searchPaginationPage={{ page: 0 }}
      />,
    );

    expect(screen.getByTestId("browse-loading")).toBeInTheDocument();
    expect(screen.queryByText("Kyosho")).not.toBeInTheDocument();
  });

  test("shows no-results state for empty search", () => {
    render(
      <TabListPageBody
        searchActive
        spinning={false}
        searchHasResults={false}
        searchContent={<div data-testid="search-content" />}
        browseItems={[]}
        renderBrowseItem={() => null}
        browsePaginationPage={{ page: 0 }}
        searchPaginationPage={{ page: 0 }}
      />,
    );

    expect(screen.getByTestId("search-content")).toBeInTheDocument();
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
