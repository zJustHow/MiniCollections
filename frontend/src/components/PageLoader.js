import SplashLoader from "./SplashLoader";
import AuthPageSkeleton from "./AuthPageSkeleton";
import ProfilePageSkeleton from "./ProfilePageSkeleton";
import ObjectDetailPageSkeleton from "./ObjectDetailPageSkeleton";
import FeedbackPageSkeleton from "./FeedbackPageSkeleton";
import StatsPageSkeleton from "./StatsPageSkeleton";
import AdminLayoutSkeleton from "./AdminLayoutSkeleton";
import AdminTableSkeleton from "./AdminTableSkeleton";
import NeuCardGridSkeleton from "./NeuCardGridSkeleton";

export default function PageLoader({ variant = "splash" }) {
  if (variant === "register") {
    return <AuthPageSkeleton variant="register" />;
  }

  if (variant === "forgotPassword") {
    return <AuthPageSkeleton variant="forgotPassword" />;
  }

  if (variant === "wechatCallback") {
    return <AuthPageSkeleton variant="wechatCallback" />;
  }

  if (variant === "stats") {
    return <StatsPageSkeleton />;
  }

  if (variant === "feedback") {
    return <FeedbackPageSkeleton />;
  }

  if (variant === "profile") {
    return <ProfilePageSkeleton />;
  }

  if (variant === "admin") {
    return <AdminLayoutSkeleton />;
  }

  if (variant === "adminTable") {
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <AdminTableSkeleton />
      </div>
    );
  }

  if (variant === "brands" || variant === "groups") {
    return <NeuCardGridSkeleton reserveSearchRow />;
  }

  if (variant === "brandObjects" || variant === "groupObjects") {
    return <NeuCardGridSkeleton variant="object" reserveSearchRow />;
  }

  if (variant === "brandObjectDetail") {
    return <ObjectDetailPageSkeleton showFollowOn />;
  }

  if (variant === "groupObjectDetail") {
    return <ObjectDetailPageSkeleton showRelatedModel />;
  }

  return <SplashLoader />;
}
