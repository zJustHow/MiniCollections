import { Column, Line, Pie } from "@ant-design/plots";
import { App } from "antd";
import NoDataPlaceholder from "../components/NoDataPlaceholder";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatsPageSkeleton from "../components/StatsPageSkeleton";
import useElementWidth from "../hooks/useElementWidth";
import { useLocale } from "../LocaleContext";
import { pickLocalizedField } from "../utils/displayLocale";
import { resolveNeuChartColors } from "../theme/chartColors";
import { bindCanvasPieLegendToggle } from "../utils/canvasPieLegend";
import { animatePieDataTransition } from "../utils/pieFilterAnimation";
import { getCollectionStats } from "../utils/statsApi";
import "../styles/stats-page.css";

const STATS_CHART_HEIGHT = 280;
const STATS_PIE_RADIUS = 0.82;
const STATS_PIE_INNER_RADIUS = 0.5;
const STATS_PIE_ANIMATE = {
  enter: { type: "waveIn" },
  update: { type: null },
  exit: { type: null },
};
const LINE_CHART_MAX_X_LABELS = 8;

function createLineChartXLabelFilter(maxLabels) {
  return (_datum, index, data) => {
    const count = data?.length ?? 0;
    if (count <= maxLabels) return true;
    if (index === 0 || index === count - 1) return true;
    const step = Math.ceil(count / maxLabels);
    return index % step === 0;
  };
}

function StatsChartCard({
  title,
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
          <NoDataPlaceholder />
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
  const piePlotRef = useRef(null);
  const pieLegendCleanupRef = useRef(null);
  const pieAnimationCancelRef = useRef(null);
  const hiddenPieTypesRef = useRef(new Set());
  const pieDataRef = useRef([]);

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
  pieDataRef.current = pieData;

  const pieLegendDomain = useMemo(
    () => pieData.map((item) => item.type),
    [pieData],
  );

  useEffect(() => {
    pieAnimationCancelRef.current?.();
    pieAnimationCancelRef.current = null;
    hiddenPieTypesRef.current = new Set();
  }, [pieData]);

  const pieLegendDomainRef = useRef(pieLegendDomain);
  pieLegendDomainRef.current = pieLegendDomain;

  const chartColors = useMemo(() => resolveNeuChartColors(), []);
  const chartColorsRef = useRef(chartColors);
  chartColorsRef.current = chartColors;

  const getPieLegendColor = (type) => {
    const colors = chartColorsRef.current;
    if (!colors.length) {
      return undefined;
    }
    const index = pieLegendDomainRef.current.indexOf(type);
    return colors[index >= 0 ? index % colors.length : 0];
  };

  const togglePieLegendType = useCallback((type) => {
    const plot = piePlotRef.current;
    const fromHidden = hiddenPieTypesRef.current;
    const next = new Set(fromHidden);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }

    hiddenPieTypesRef.current = next;

    if (!plot) {
      return;
    }

    pieAnimationCancelRef.current?.();
    pieAnimationCancelRef.current = animatePieDataTransition(
      plot,
      pieDataRef.current,
      fromHidden,
      next,
      {
        legendDomain: pieLegendDomainRef.current,
        hiddenTypes: next,
        getLegendColor: getPieLegendColor,
      },
    );
  }, []);

  const togglePieLegendTypeRef = useRef(togglePieLegendType);
  togglePieLegendTypeRef.current = togglePieLegendType;

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

  const pieColorScale = useMemo(
    () => ({
      color: {
        domain: pieLegendDomain,
        range: chartColors,
      },
    }),
    [pieLegendDomain, chartColors],
  );

  const bindPieLegend = useCallback((plot) => {
    pieLegendCleanupRef.current?.();
    pieLegendCleanupRef.current = bindCanvasPieLegendToggle(plot, {
      getDomain: () => pieLegendDomainRef.current,
      getHiddenTypes: () => hiddenPieTypesRef.current,
      getLegendColor: getPieLegendColor,
      onToggle: (type) => togglePieLegendTypeRef.current(type),
    });
  }, []);

  const handlePieChartReady = useCallback(
    (plot) => {
      piePlotRef.current = plot;
      bindPieLegend(plot);
    },
    [bindPieLegend],
  );

  useEffect(() => {
    const plot = piePlotRef.current;
    if (plot) {
      bindPieLegend(plot);
    }
  }, [bindPieLegend, pieLegendDomain]);

  useEffect(() => {
    return () => {
      pieAnimationCancelRef.current?.();
      pieAnimationCancelRef.current = null;
      pieLegendCleanupRef.current?.();
      pieLegendCleanupRef.current = null;
    };
  }, []);

  if (loading) {
    return <StatsPageSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const chartBaseProps = {
    height: STATS_CHART_HEIGHT,
    theme: { color: chartColors },
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
            data={pieData}
          >
            <Pie
              {...chartBaseProps}
              autoFit
              data={pieData}
              angleField="value"
              colorField="type"
              keyField="type"
              scale={pieColorScale}
              radius={STATS_PIE_RADIUS}
              innerRadius={STATS_PIE_INNER_RADIUS}
              animate={STATS_PIE_ANIMATE}
              interaction={{ legendFilter: false }}
              legend={{ position: "bottom" }}
              label={false}
              onReady={handlePieChartReady}
            />
          </StatsChartCard>

          <StatsChartCard
            title={t("brandCounts")}
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
              style={{ fill: chartColors[0] }}
            />
          </StatsChartCard>

          <StatsChartCard
            title={t("purchaseTrend")}
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
                x: {
                  labelAutoHide: true,
                  labelFilter: createLineChartXLabelFilter(
                    LINE_CHART_MAX_X_LABELS,
                  ),
                },
                y: { title: t("statsCumulativeSpend") },
              }}
            />
          </StatsChartCard>
        </div>
      </div>
    </div>
  );
}
