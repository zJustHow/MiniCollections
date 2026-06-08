import { Grid } from "antd";

const { useBreakpoint } = Grid;

export default function ObjectListPageLayout({
  showFilterColumn = false,
  summary,
  search,
  filter,
  children,
}) {
  const screens = useBreakpoint();
  const withFilter = showFilterColumn && screens.lg;
  const stacked = !screens.lg;
  const showSummaryInToolbar = Boolean(summary) && !(stacked && showFilterColumn);
  const withToolbar = Boolean(search || showSummaryInToolbar);

  return (
    <div
      className={`neu-list-page-layout${
        withToolbar ? " neu-list-page-layout--with-toolbar" : ""
      }${withFilter ? " neu-list-page-layout--with-filter" : ""}${
        stacked ? " neu-list-page-layout--stacked" : ""
      }`}
    >
      {withToolbar ? (
        <div className="neu-list-page-toolbar">
          {showSummaryInToolbar ? (
            <div className="neu-list-page-summary">{summary}</div>
          ) : null}
          {search ? <div className="neu-list-page-search">{search}</div> : null}
        </div>
      ) : null}
      {withFilter && filter ? (
        <div className="neu-list-page-filter">{filter}</div>
      ) : null}
      <div className="neu-list-page-content">{children}</div>
    </div>
  );
}
