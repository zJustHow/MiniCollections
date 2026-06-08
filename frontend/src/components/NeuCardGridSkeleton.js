import { Grid } from "antd";
import NeuCardSkeleton from "./NeuCardSkeleton";

const { useBreakpoint } = Grid;

export const DEFAULT_SKELETON_COUNT = 8;
export const FILTER_SKELETON_COUNT = 6;

export default function NeuCardGridSkeleton({
  count,
  withFilter = false,
  variant = "catalog",
  className = "neu-list-page-browse-grid",
}) {
  const screens = useBreakpoint();
  const useFilterCount = withFilter && screens.lg;
  const resolvedCount =
    count ?? (useFilterCount ? FILTER_SKELETON_COUNT : DEFAULT_SKELETON_COUNT);

  return (
    <div className={className} aria-busy="true">
      {Array.from({ length: resolvedCount }, (_, index) => (
        <NeuCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}
