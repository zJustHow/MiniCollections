import { Spin } from "antd";
import AdminLayoutSkeleton from "./AdminLayoutSkeleton";
import AdminTableSkeleton from "./AdminTableSkeleton";
import FeedbackPageSkeleton from "./FeedbackPageSkeleton";

export default function PageLoader({ variant = "spin" }) {
  if (variant === "feedback") {
    return <FeedbackPageSkeleton />;
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

  return (
    <div className="neu-page-loader" aria-busy="true">
      <Spin size="large" />
    </div>
  );
}
