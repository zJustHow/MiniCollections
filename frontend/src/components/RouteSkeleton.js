import PageLoader from "./PageLoader";
import { resolveRouteSkeletonVariant } from "../utils/routeSkeleton";

export default function RouteSkeleton({ pathname }) {
  const variant = resolveRouteSkeletonVariant(pathname);
  return <PageLoader variant={variant} />;
}
