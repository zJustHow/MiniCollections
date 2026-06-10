import { useLayoutEffect, useState } from "react";

export default function useElementWidth(ref, active = true) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!active) {
      setWidth(0);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const sync = () => {
      setWidth(node.getBoundingClientRect().width);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, active]);

  return width;
}
