import { Grid } from "antd";
import SearchResultsSummary from "./SearchResultsSummary";

const { useBreakpoint } = Grid;

export default function ObjectListSearchToolbar({
  searchActive,
  keyword,
  resultCount,
  totalExact = true,
  resultsLoading,
  children,
}) {
  const screens = useBreakpoint();

  return (
    <div
      className={`neu-search-toolbar${
        screens.md ? "" : " neu-search-toolbar--stacked"
      }`}
    >
      <SearchResultsSummary
        active={searchActive}
        keyword={keyword}
        count={resultCount}
        exact={totalExact}
        loading={resultsLoading}
      />
      <div className="neu-search-toolbar-input">{children}</div>
    </div>
  );
}
