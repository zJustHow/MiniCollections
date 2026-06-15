import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import { colors } from "@minicollections/theme";
import { SplashLoaderSkeleton } from "../components/skeleton";

type FontProviderProps = {
  children: ReactNode;
};

export default function FontProvider({ children }: FontProviderProps) {
  const [loaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  });

  if (!loaded) {
    return (
      <View style={styles.splash}>
        <SplashLoaderSkeleton />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
