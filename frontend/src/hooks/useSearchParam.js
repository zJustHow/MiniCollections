import { useSearchParams } from "react-router-dom";

export default function useSearchParam(key = "q") {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) || "";

  const setValue = (newValue) => {
    if (newValue) {
      setSearchParams({ [key]: newValue }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return [value, setValue];
}
