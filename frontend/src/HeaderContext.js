import { createContext, useCallback, useContext, useState } from "react";

const HeaderContext = createContext({ headerSlot: null, setHeaderSlot: () => {} });

export function HeaderProvider({ children }) {
  const [headerSlot, setHeaderSlot] = useState(null);
  const stableSet = useCallback((slot) => setHeaderSlot(slot), []);
  return (
    <HeaderContext.Provider value={{ headerSlot, setHeaderSlot: stableSet }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}
