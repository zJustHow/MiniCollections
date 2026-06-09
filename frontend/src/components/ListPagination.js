import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined.js";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined.js";
import { Grid } from "antd";
import NeuButton from "./NeuButton";
import { useLocale } from "../LocaleContext";

const { useBreakpoint } = Grid;

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(sorted[i]);
  }
  return result;
}

export default function ListPagination({
  page,
  totalPages,
  loading,
  onPageChange,
}) {
  const { t } = useLocale();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;
  const current = page + 1;

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(current, totalPages);

  return (
    <div
      className="neu-pagination-row"
      style={{ "--neu-grid-cols": cols }}
    >
      <div className="neu-pagination-controls">
        <NeuButton
          pagination
          icon={<LeftOutlined />}
          disabled={loading || current <= 1}
          aria-label={t("previousPage")}
          onClick={() => onPageChange(current - 1)}
        />

        {pageNumbers.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="neu-pagination-ellipsis"
              aria-hidden
            >
              …
            </span>
          ) : (
            <NeuButton
              key={item}
              pagination
              current={item === current}
              disabled={loading}
              aria-current={item === current ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </NeuButton>
          ),
        )}

        <NeuButton
          pagination
          icon={<RightOutlined />}
          disabled={loading || current >= totalPages}
          aria-label={t("nextPage")}
          onClick={() => onPageChange(current + 1)}
        />
      </div>
    </div>
  );
}
