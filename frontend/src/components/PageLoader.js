import AuthPageSkeleton from "./AuthPageSkeleton";
import SplashLoader from "./SplashLoader";
import AdminLayoutSkeleton from "./AdminLayoutSkeleton";
import AdminTableSkeleton from "./AdminTableSkeleton";
import FeedbackPageSkeleton from "./FeedbackPageSkeleton";
import NeuCardGridSkeleton from "./NeuCardGridSkeleton";
import ObjectDetailPageSkeleton from "./ObjectDetailPageSkeleton";
import ProfilePageSkeleton from "./ProfilePageSkeleton";

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
    return <NeuCardGridSkeleton />;
  }

  if (variant === "brandObjects" || variant === "groupObjects") {
    return <NeuCardGridSkeleton variant="object" />;
  }

  if (variant === "brandObjectDetail") {
    return <ObjectDetailPageSkeleton />;
  }

  if (variant === "groupObjectDetail") {
    return <ObjectDetailPageSkeleton showRelatedModel />;
  }

  return <SplashLoader />;
}
