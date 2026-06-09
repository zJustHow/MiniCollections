import { lazy, Suspense } from "react";
import SplashLoader from "./SplashLoader";
import AuthPageSkeleton from "./AuthPageSkeleton";
import ProfilePageSkeleton from "./ProfilePageSkeleton";
const FeedbackPageSkeleton = lazy(() => import("./FeedbackPageSkeleton"));
const AdminLayoutSkeleton = lazy(() => import("./AdminLayoutSkeleton"));
const AdminTableSkeleton = lazy(() => import("./AdminTableSkeleton"));
const NeuCardGridSkeleton = lazy(() => import("./NeuCardGridSkeleton"));
const ObjectDetailPageSkeleton = lazy(() => import("./ObjectDetailPageSkeleton"));

function LazySkeleton({ children }) {
  return <Suspense fallback={<SplashLoader />}>{children}</Suspense>;
}

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
    return (
      <LazySkeleton>
        <FeedbackPageSkeleton />
      </LazySkeleton>
    );
  }

  if (variant === "profile") {
    return <ProfilePageSkeleton />;
  }

  if (variant === "admin") {
    return (
      <LazySkeleton>
        <AdminLayoutSkeleton />
      </LazySkeleton>
    );
  }

  if (variant === "adminTable") {
    return (
      <LazySkeleton>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AdminTableSkeleton />
        </div>
      </LazySkeleton>
    );
  }

  if (variant === "brands" || variant === "groups") {
    return (
      <LazySkeleton>
        <NeuCardGridSkeleton />
      </LazySkeleton>
    );
  }

  if (variant === "brandObjects" || variant === "groupObjects") {
    return (
      <LazySkeleton>
        <NeuCardGridSkeleton variant="object" />
      </LazySkeleton>
    );
  }

  if (variant === "brandObjectDetail") {
    return (
      <LazySkeleton>
        <ObjectDetailPageSkeleton />
      </LazySkeleton>
    );
  }

  if (variant === "groupObjectDetail") {
    return (
      <LazySkeleton>
        <ObjectDetailPageSkeleton showRelatedModel />
      </LazySkeleton>
    );
  }

  return <SplashLoader />;
}
