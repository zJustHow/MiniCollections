/** Semantic chart palette — maps to styles/neumorphism/tokens.css */
export const NEU_CHART_COLOR_VARS = [
  "--neu-accent",
  "--neu-success",
  "--neu-cyan",
  "--neu-warning",
  "--neu-danger",
  "--neu-volcano",
  "--neu-purple",
  "--neu-accent-light",
];

export function resolveCssVar(name, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

export function resolveNeuChartColors(element = document.documentElement) {
  return NEU_CHART_COLOR_VARS.map((name) => resolveCssVar(name, element));
}
