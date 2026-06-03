import { useSearchParams } from "react-router-dom";

export default function useSearchParam(key = "q") {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) || "";

  const setValue = (newValue) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newValue) {
          next.set(key, newValue);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  return [value, setValue];
}
