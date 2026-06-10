import NeuCardSkeleton from "./NeuCardSkeleton";
import ObjectListPageLayout from "./ObjectListPageLayout";
import ListSearchFieldSkeleton from "./listPage/ListSearchFieldSkeleton";
import { PAGE_SIZE } from "../utils/apiClient";

export default function NeuCardGridSkeleton({
  variant = "catalog",
  className = "neu-list-page-browse-grid",
  reserveSearchRow = false,
}) {
  const grid = (
    <div className={className}>
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <NeuCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );

  if (!reserveSearchRow) {
    return <div aria-busy="true">{grid}</div>;
  }

  return (
    <ObjectListPageLayout
      summary={<span aria-hidden="true" />}
      search={<ListSearchFieldSkeleton />}
    >
      <div aria-busy="true">{grid}</div>
    </ObjectListPageLayout>
  );
}
