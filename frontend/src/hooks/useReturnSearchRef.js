import { useEffect, useRef } from "react";

export default function useReturnSearchRef(returnSearch) {
  const returnSearchRef = useRef(returnSearch ?? "");

  useEffect(() => {
    if (returnSearch != null) {
      returnSearchRef.current = returnSearch;
    }
  }, [returnSearch]);

  return returnSearchRef;
}
