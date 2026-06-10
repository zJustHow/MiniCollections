export function resolveG2Chart(chart) {
  if (chart?.getContext) {
    return chart;
  }
  return chart?.chart ?? null;
}
