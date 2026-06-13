import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StatsScreen from "../screens/StatsScreen";
import type { StatsStackParamList } from "./types";
import { colors } from "@minicollections/theme";

const Stack = createNativeStackNavigator<StatsStackParamList>();

export default function StatsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="StatsHome" component={StatsScreen} />
    </Stack.Navigator>
  );
}
