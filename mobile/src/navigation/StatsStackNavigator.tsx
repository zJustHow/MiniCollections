import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StatsScreen from "../screens/StatsScreen";
import type { StatsStackParamList } from "./types";
import { useTabStackScreenOptions } from "./useTabStackScreenOptions";

const Stack = createNativeStackNavigator<StatsStackParamList>();

export default function StatsStackNavigator() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StatsHome" component={StatsScreen} />
    </Stack.Navigator>
  );
}
