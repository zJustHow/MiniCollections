import NeuCardSkeleton from "./NeuCardSkeleton";
import { PAGE_SIZE } from "../utils/apiClient";

export default function NeuCardGridSkeleton({
  variant = "catalog",
  className = "neu-list-page-browse-grid",
}) {
  return (
    <div className={className} aria-busy="true">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <NeuCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}
