import { useMemo } from "react";
import { colors } from "@minicollections/theme";

/** Shared native-stack options for screens rendered under the tab AppTopBar. */
export function useTabStackScreenOptions() {
  return useMemo(
    () => ({
      headerShown: false as const,
      contentStyle: {
        backgroundColor: colors.bg,
      },
    }),
    [],
  );
}
