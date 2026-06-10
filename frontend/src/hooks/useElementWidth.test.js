import { render, act } from "@testing-library/react";
import { useRef } from "react";
import useElementWidth from "./useElementWidth";

function Probe({ active }) {
  const ref = useRef(null);
  const width = useElementWidth(ref, active);
  return (
    <div ref={ref} style={{ width: 320 }}>
      {width}
    </div>
  );
}

describe("useElementWidth", () => {
  beforeEach(() => {
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    global.ResizeObserver = ResizeObserverMock;

    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 320,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
  });

  test("measures width when activated after mount", async () => {
    const { rerender, findByText } = render(<Probe active={false} />);
    rerender(<Probe active={true} />);
    expect(await findByText("320")).toBeInTheDocument();
  });
});
