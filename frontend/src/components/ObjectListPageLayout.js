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
  const stacked = !screens.md;

  return (
    <div
      className={`neu-list-page-layout${
        withFilter ? " neu-list-page-layout--with-filter" : ""
      }${stacked ? " neu-list-page-layout--stacked" : ""}`}
    >
      {summary ? <div className="neu-list-page-summary">{summary}</div> : null}
      {withFilter && filter ? (
        <div className="neu-list-page-filter">{filter}</div>
      ) : null}
      <div className="neu-list-page-content">
        {search ? <div className="neu-list-page-search">{search}</div> : null}
        {children}
      </div>
    </div>
  );
}
