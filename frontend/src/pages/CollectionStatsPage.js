import { Column, Line, Pie } from "@ant-design/plots";
import { App, Empty } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import StatsPageSkeleton from "../components/StatsPageSkeleton";
import useElementWidth from "../hooks/useElementWidth";
import { useLocale } from "../LocaleContext";
import { pickLocalizedField } from "../utils/displayLocale";
import { getCollectionStats } from "../utils/statsApi";
import "../styles/stats-page.css";

const STATS_CHART_HEIGHT = 280;

const CHART_COLORS = [
  "#5592cc",
  "#3d78b8",
  "#7c9eb2",
  "#a8b8c4",
  "#c5d0d8",
  "#5a7a8c",
];

const CHART_THEME = { color: CHART_COLORS };

function StatsChartCard({
  title,
  emptyDescription,
  data,
  className = "",
  chartWrapRef,
  children,
}) {
  return (
    <section className={`stats-card ${className}`.trim()}>
      <h3 className="stats-card-title">{title}</h3>
      {data.length === 0 ? (
        <div className="stats-empty">
          <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <div className="stats-chart-wrap" ref={chartWrapRef}>
          {children}
        </div>
      )}
    </section>
  );
}

export default function CollectionStatsPage() {
  const { message } = App.useApp();
  const { locale, t } = useLocale();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const columnWrapRef = useRef(null);

  useEffect(() => {
    getCollectionStats()
      .then(setStats)
      .catch((err) => {
        message.error(err?.message || t("statsLoadFailed"));
      })
      .finally(() => setLoading(false));
  }, [message, t]);

  const localizedName = (item) =>
    pickLocalizedField(
      item,
      { enKey: "name_en", zhKey: "name_zh" },
      locale,
    ) ?? item.name_en;

  const pieData = useMemo(
    () =>
      (stats?.by_category ?? []).map((item) => ({
        type: localizedName(item),
        value: item.count,
      })),
    [stats, locale],
  );

  const lineData = useMemo(
    () =>
      (stats?.purchase_trend ?? []).map((point) => ({
        date: point.date,
        value: Number(point.cumulative_total),
      })),
    [stats],
  );

  const barData = useMemo(
    () =>
      (stats?.by_brand ?? []).map((item) => ({
        brand:
          localizedName(item) ||
          item.name_en ||
          String(item.brand_id ?? ""),
        count: Number(item.count),
      })),
    [stats, locale],
  );

  const columnChartActive = !loading && barData.length > 0;
  const columnWidth = useElementWidth(columnWrapRef, columnChartActive);

  if (loading) {
    return <StatsPageSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const chartBaseProps = {
    height: STATS_CHART_HEIGHT,
    theme: CHART_THEME,
    containerStyle: { height: STATS_CHART_HEIGHT },
    style: { overflow: "hidden" },
  };

  return (
    <div className="stats-page">
      <div className="stats-page-inner">
        <h2 className="stats-page-title">{t("collectionStats")}</h2>
        <p className="stats-page-summary">
          {t("statsTotalObjects")}: {stats.total_objects}
        </p>

        <div className="stats-grid">
          <StatsChartCard
            title={t("categoryDistribution")}
            emptyDescription={t("statsNoCategoryData")}
            data={pieData}
          >
            <Pie
              {...chartBaseProps}
              autoFit
              data={pieData}
              angleField="value"
              colorField="type"
              radius={0.82}
              innerRadius={0.5}
              legend={{ position: "bottom" }}
              label={{
                text: (datum) => `${datum.type} (${datum.value})`,
                style: { fontSize: 11 },
              }}
            />
          </StatsChartCard>

          <StatsChartCard
            title={t("brandCounts")}
            emptyDescription={t("statsNoBrandData")}
            data={barData}
            chartWrapRef={columnWrapRef}
          >
            <Column
              {...chartBaseProps}
              autoFit={columnWidth <= 0}
              width={columnWidth > 0 ? columnWidth : undefined}
              data={barData}
              xField="brand"
              yField="count"
              scale={{ x: { paddingInner: 0.35 } }}
              axis={{
                x: { labelAutoRotate: true, labelAutoHide: true },
              }}
              style={{ fill: CHART_COLORS[0] }}
            />
          </StatsChartCard>

          <StatsChartCard
            title={t("purchaseTrend")}
            emptyDescription={t("statsNoPurchaseData")}
            data={lineData}
            className="stats-card--wide"
          >
            <Line
              {...chartBaseProps}
              autoFit
              data={lineData}
              xField="date"
              yField="value"
              smooth
              axis={{
                y: { title: t("statsCumulativeSpend") },
              }}
            />
          </StatsChartCard>
        </div>
      </div>
    </div>
  );
}
