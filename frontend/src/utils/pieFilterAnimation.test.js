import {
  buildTransitionPieData,
  easeOutCubic,
  MIN_SLICE_VALUE,
} from "./pieFilterAnimation";

const pieData = [
  { type: "A", value: 50 },
  { type: "B", value: 30 },
  { type: "C", value: 20 },
];

describe("pieFilterAnimation", () => {
  test("easeOutCubic ends at 1", () => {
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0)).toBe(0);
  });

  test("shrinks a category while hiding it", () => {
    const fromHidden = new Set();
    const toHidden = new Set(["A"]);

    const start = buildTransitionPieData(pieData, fromHidden, toHidden, 0);
    const mid = buildTransitionPieData(pieData, fromHidden, toHidden, 0.5);
    const end = buildTransitionPieData(pieData, fromHidden, toHidden, 1);

    expect(start).toHaveLength(3);
    expect(start[0].value).toBe(50);
    expect(mid[0].value).toBeCloseTo(50 * (1 - easeOutCubic(0.5)), 1);
    expect(end).toHaveLength(2);
    expect(end.find((item) => item.type === "A")).toBeUndefined();
  });

  test("grows a category while showing it", () => {
    const fromHidden = new Set(["B"]);
    const toHidden = new Set();

    const start = buildTransitionPieData(pieData, fromHidden, toHidden, 0);
    const mid = buildTransitionPieData(pieData, fromHidden, toHidden, 0.5);

    expect(start).toHaveLength(3);
    expect(start.find((item) => item.type === "B")?.value).toBe(
      MIN_SLICE_VALUE,
    );
    expect(mid).toHaveLength(3);
    expect(mid.find((item) => item.type === "B")?.value).toBeCloseTo(
      30 * easeOutCubic(0.5),
      1,
    );
  });
});
