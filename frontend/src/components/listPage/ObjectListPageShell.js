import ObjectListPageLayout from "../ObjectListPageLayout";
import SearchResultsSummary from "../SearchResultsSummary";
import ListSearchField from "./ListSearchField";

export default function ObjectListPageShell({
  framed = false,
  showFilterColumn = false,
  filter = null,
  searchActive,
  searchKeyword,
  resultPage,
  searchFieldId,
  searchFieldName,
  searchPlaceholder,
  draftQuery,
  onDraftChange,
  onSearch,
  children,
}) {
  const layout = (
    <ObjectListPageLayout
      showFilterColumn={showFilterColumn}
      summary={
        <SearchResultsSummary
          active={searchActive}
          keyword={searchKeyword}
          count={resultPage?.totalElements ?? 0}
          exact={resultPage?.totalExact}
          loading={searchActive && resultPage?.loading}
        />
      }
      search={
        <ListSearchField
          id={searchFieldId}
          name={searchFieldName}
          placeholder={searchPlaceholder}
          value={draftQuery}
          onChange={onDraftChange}
          onSearch={onSearch}
        />
      }
      filter={filter}
    >
      {children}
    </ObjectListPageLayout>
  );

  if (!framed) return layout;

  return (
    <div style={{ position: "relative", minHeight: 200, width: "100%" }}>
      {layout}
    </div>
  );
}
