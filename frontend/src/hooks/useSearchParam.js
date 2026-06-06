import { useSearchParams } from "react-router-dom";
import { mutateSearchParams } from "../utils/searchParams";

export default function useSearchParam(key = "q") {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) || "";

  const setValue = (newValue) => {
    mutateSearchParams(
      setSearchParams,
      (next) => {
        if (newValue) {
          next.set(key, newValue);
        } else {
          next.delete(key);
        }
      },
      { replace: true },
    );
  };

  return [value, setValue];
}
