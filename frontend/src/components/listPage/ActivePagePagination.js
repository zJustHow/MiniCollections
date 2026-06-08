import ListPagination from "../ListPagination";
import { PAGE_SIZE } from "../../utils/apiClient";

export default function ActivePagePagination({
  activePage,
  pageSize = PAGE_SIZE,
  includeTotals = true,
}) {
  if (!activePage) return null;

  return (
    <ListPagination
      page={activePage.page}
      totalElements={includeTotals ? activePage.totalElements : undefined}
      totalPages={activePage.totalPages}
      totalExact={includeTotals ? activePage.totalExact : undefined}
      loading={activePage.loading}
      onPageChange={activePage.onPageChange}
      pageSize={pageSize}
    />
  );
}
