import { Pagination } from "antd";
import { useLocale } from "../LocaleContext";

export default function ListPagination({
  page,
  totalElements,
  totalPages,
  totalExact,
  loading,
  onPageChange,
  pageSize = 24,
}) {
  const { t } = useLocale();

  if (totalPages <= 1 && totalElements === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
      <Pagination
        current={page + 1}
        pageSize={pageSize}
        total={totalElements}
        onChange={onPageChange}
        showSizeChanger={false}
        hideOnSinglePage
        disabled={loading}
        showTotal={(total, range) =>
          totalExact
            ? t("showingRangeOfTotal")
                .replace("{from}", range[0])
                .replace("{to}", range[1])
                .replace("{total}", total)
            : t("showingRangeOfTotalPlus")
                .replace("{from}", range[0])
                .replace("{to}", range[1])
                .replace("{total}", total)
        }
      />
    </div>
  );
}
