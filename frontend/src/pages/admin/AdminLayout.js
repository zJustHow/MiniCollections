import NeuPressableButton from "../../components/NeuPressableButton";
import AdminSidebarSkeleton from "../../components/AdminSidebarSkeleton";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";
import { App } from "antd";
import CheckCircleOutlined from "@ant-design/icons/es/icons/CheckCircleOutlined.js";
import ClockCircleOutlined from "@ant-design/icons/es/icons/ClockCircleOutlined.js";
import CloseCircleOutlined from "@ant-design/icons/es/icons/CloseCircleOutlined.js";
import AppstoreOutlined from "@ant-design/icons/es/icons/AppstoreOutlined.js";
import ColumnHeightOutlined from "@ant-design/icons/es/icons/ColumnHeightOutlined.js";
import TagsOutlined from "@ant-design/icons/es/icons/TagsOutlined.js";
import UnorderedListOutlined from "@ant-design/icons/es/icons/UnorderedListOutlined.js";
import { Suspense, useCallback, useEffect, useState, useTransition } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { getAdminSubmissionCounts } from "../../utils/submissionsApi";
import { useLocale } from "../../LocaleContext";
import { neuRem } from "../../theme/fontScale";

function adminTableSkeletonColumns(pathname) {
  if (!pathname) return 7;
  if (/^\/admin\/brands\/[^/]+/.test(pathname)) return 8;
  if (pathname.startsWith("/admin/brands")) return 3;
  if (pathname.startsWith("/admin/categories")) return 6;
  if (pathname.startsWith("/admin/scales")) return 4;
  return 7;
}

export function useAdminLayoutContext() {
  return useOutletContext();
}

export default function AdminLayout() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavPending, startNavTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState(location.pathname);
  const displayPath = isNavPending ? pendingPath : location.pathname;
  const skeletonColumns = adminTableSkeletonColumns(displayPath);
  const brandsNavActive = displayPath.startsWith("/admin/brands");
  const categoriesNavActive = displayPath.startsWith("/admin/categories");
  const scalesNavActive = displayPath.startsWith("/admin/scales");
  const catalogNavActive = categoriesNavActive || scalesNavActive;
  const submissionsNavActive = !brandsNavActive && !catalogNavActive;
  const showSidebar = !brandsNavActive && !catalogNavActive;

  const navigateAdmin = useCallback(
    (to, options) => {
      let target = to;
      if (typeof to === "string") {
        target = to.startsWith("/")
          ? to
          : `${location.pathname.replace(/\/?$/, "/")}${to}`;
        setPendingPath(target);
      }
      startNavTransition(() => navigate(target, options));
    },
    [navigate, location.pathname],
  );

  const goToSubmissions = (statusKey) => {
    setActiveStatus(statusKey);
    if (location.pathname !== "/admin") {
      navigateAdmin("/admin", { state: { adminStatus: statusKey } });
    }
  };

  const [activeStatus, setActiveStatus] = useState(
    () => location.state?.adminStatus ?? "PENDING",
  );
  const [statusCounts, setStatusCounts] = useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    ALL: 0,
  });
  const [sidebarReady, setSidebarReady] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await getAdminSubmissionCounts();
      setStatusCounts({
        PENDING: data?.pending ?? 0,
        APPROVED: data?.approved ?? 0,
        REJECTED: data?.rejected ?? 0,
        ALL: data?.total ?? 0,
      });
    } catch (err) {
      message.error(err?.message || t("failedToLoadSubmissions"));
    } finally {
      setSidebarReady(true);
    }
  }, [message, t]);

  useEffect(() => {
    if (!showSidebar) return;
    fetchSubmissions();
  }, [showSidebar, fetchSubmissions]);

  useEffect(() => {
    if (location.state?.adminStatus) {
      setActiveStatus(location.state.adminStatus);
    }
  }, [location.state?.adminStatus]);

  useEffect(() => {
    setPendingPath(location.pathname);
  }, [location.pathname]);

  const statusOptions = [
    { key: "PENDING", label: t("submissionsPending"), icon: <ClockCircleOutlined /> },
    { key: "APPROVED", label: t("submissionsApproved"), icon: <CheckCircleOutlined /> },
    { key: "REJECTED", label: t("submissionsRejected"), icon: <CloseCircleOutlined /> },
    { key: "ALL", label: t("submissionsAll"), icon: <UnorderedListOutlined /> },
  ];

  return (
    <div>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {showSidebar &&
          (sidebarReady ? (
          <div
            className="neu-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: 160,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: neuRem(11),
                color: "var(--neu-text-2)",
                padding: "4px 10px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("adminSubmissions")}
            </div>
            {statusOptions.map(({ key, label, icon }) => (
              <NeuPressableButton
                key={key}
                active={submissionsNavActive && activeStatus === key}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: neuRem(13),
                }}
                onClick={() => goToSubmissions(key)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {icon}
                  {label}
                </span>
                <span className="neu-admin-submission-count">
                  {statusCounts[key]}
                </span>
              </NeuPressableButton>
            ))}

            <div
              style={{
                height: 1,
                background: "rgba(184,182,176,0.25)",
                margin: "4px 8px",
              }}
            />

            <div
              style={{
                fontSize: neuRem(11),
                color: "var(--neu-text-2)",
                padding: "0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("adminBrands")}
            </div>
            <NeuPressableButton
              active={brandsNavActive}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: neuRem(13),
              }}
              onClick={() => navigateAdmin("/admin/brands")}
            >
              <TagsOutlined />
              {t("brands")}
            </NeuPressableButton>

            <div
              style={{
                height: 1,
                background: "rgba(184,182,176,0.25)",
                margin: "4px 8px",
              }}
            />

            <div
              style={{
                fontSize: neuRem(11),
                color: "var(--neu-text-2)",
                padding: "0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("adminCatalog")}
            </div>
            <NeuPressableButton
              active={categoriesNavActive}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: neuRem(13),
              }}
              onClick={() => navigateAdmin("/admin/categories")}
            >
              <AppstoreOutlined />
              {t("categories")}
            </NeuPressableButton>
            <NeuPressableButton
              active={scalesNavActive}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: neuRem(13),
              }}
              onClick={() => navigateAdmin("/admin/scales")}
            >
              <ColumnHeightOutlined />
              {t("scales")}
            </NeuPressableButton>
          </div>
        ) : (
          <AdminSidebarSkeleton />
        ))}

        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <Suspense
            fallback={
              <AdminTableSkeleton
                columns={adminTableSkeletonColumns(location.pathname)}
                rows={10}
              />
            }
          >
            <Outlet
              context={{
                activeStatus,
                setActiveStatus,
                refreshSubmissions: fetchSubmissions,
                navigateAdmin,
              }}
            />
          </Suspense>
          {isNavPending && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background: "var(--neu-bg)",
              }}
            >
              <AdminTableSkeleton columns={skeletonColumns} rows={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
