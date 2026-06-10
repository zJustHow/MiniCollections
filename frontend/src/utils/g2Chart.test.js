import { resolveG2Chart } from "./g2Chart";

describe("resolveG2Chart", () => {
  test("unwraps ant-design plots instance", () => {
    const g2Chart = { getContext: () => ({}) };
    expect(resolveG2Chart({ chart: g2Chart })).toBe(g2Chart);
    expect(resolveG2Chart(g2Chart)).toBe(g2Chart);
  });
});
