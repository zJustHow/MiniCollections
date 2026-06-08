import { neuBtnProps } from "./NeuButton";

describe("neuBtnProps", () => {
  test("merges neu-btn class with custom className", () => {
    expect(neuBtnProps({ className: "extra" }).className).toBe("neu-btn extra");
  });

  test("passes through other props", () => {
    const onClick = vi.fn();
    expect(neuBtnProps({ onClick, disabled: true })).toMatchObject({
      onClick,
      disabled: true,
      className: "neu-btn",
    });
  });
});
