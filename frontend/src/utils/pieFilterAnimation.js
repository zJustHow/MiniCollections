import { schedulePieLegendOpacitySync } from "./canvasPieLegend";
import { resolveG2Chart } from "./g2Chart";

export const MIN_SLICE_VALUE = 0.001;

const PIE_TRANSITION_ANIMATE = {
  enter: { type: null },
  update: { type: null },
  exit: { type: null },
};

function hiddenSetsEqual(fromHidden, toHidden) {
  if (fromHidden.size !== toHidden.size) {
    return false;
  }
  for (const type of fromHidden) {
    if (!toHidden.has(type)) {
      return false;
    }
  }
  return true;
}

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function buildTransitionPieData(pieData, fromHidden, toHidden, t) {
  const eased = easeOutCubic(t);

  return pieData
    .map((item) => {
      const wasHidden = fromHidden.has(item.type);
      const willHide = toHidden.has(item.type);

      if (!wasHidden && willHide) {
        const value = item.value * (1 - eased);
        if (t >= 1) {
          return null;
        }
        return { ...item, value: Math.max(MIN_SLICE_VALUE, value) };
      }
      if (wasHidden && !willHide) {
        const value = Math.max(MIN_SLICE_VALUE, item.value * eased);
        return { ...item, value };
      }
      if (willHide) {
        return null;
      }
      return { ...item };
    })
    .filter(Boolean);
}

export function updatePieChartData(
  plot,
  data,
  {
    hiddenTypes = new Set(),
    legendDomain = [],
    getLegendColor,
  } = {},
) {
  const g2Chart = resolveG2Chart(plot);
  if (!g2Chart?.options) {
    return;
  }

  const spec = g2Chart.options();
  const children = spec.children?.map((child) =>
    child?.type === "interval"
      ? {
          ...child,
          data,
          animate: PIE_TRANSITION_ANIMATE,
        }
      : child,
  );

  g2Chart.options({ children });
  g2Chart.render();
  schedulePieLegendOpacitySync(plot, {
    domain: legendDomain,
    hiddenTypes,
    getLegendColor,
  });
}

export function animatePieDataTransition(
  plot,
  pieData,
  fromHidden,
  toHidden,
  {
    duration = 320,
    legendDomain = [],
    hiddenTypes,
    getLegendColor,
  } = {},
) {
  const targetHidden = hiddenTypes ?? toHidden;
  const chartOptions = {
    hiddenTypes: targetHidden,
    legendDomain,
    getLegendColor,
  };

  if (!plot || hiddenSetsEqual(fromHidden, toHidden)) {
    updatePieChartData(
      plot,
      buildTransitionPieData(pieData, fromHidden, toHidden, 1),
      chartOptions,
    );
    return () => {};
  }

  const start = performance.now();
  let frameId = null;
  let cancelled = false;

  const run = (now) => {
    if (cancelled) {
      return;
    }

    const t = Math.min(1, (now - start) / duration);
    updatePieChartData(
      plot,
      buildTransitionPieData(pieData, fromHidden, toHidden, t),
      chartOptions,
    );

    if (t < 1) {
      frameId = requestAnimationFrame(run);
      return;
    }

  };

  frameId = requestAnimationFrame(run);

  return () => {
    cancelled = true;
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };
}
