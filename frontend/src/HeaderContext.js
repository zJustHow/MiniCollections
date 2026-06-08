import { createContext, useCallback, useContext, useMemo, useState } from "react";

const HeaderContext = createContext({ headerSlot: null, setHeaderSlot: () => {} });

export function HeaderProvider({ children }) {
  const [headerSlot, setHeaderSlot] = useState(null);
  const stableSet = useCallback((slot) => setHeaderSlot(slot), []);
  const value = useMemo(
    () => ({ headerSlot, setHeaderSlot: stableSet }),
    [headerSlot, stableSet],
  );
  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}
