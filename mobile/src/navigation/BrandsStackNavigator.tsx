import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrandsScreen from "../screens/BrandsScreen";
import BrandObjectsScreen from "../screens/BrandObjectsScreen";
import BrandObjectDetailScreen from "../screens/BrandObjectDetailScreen";
import type { BrandsStackParamList } from "./types";
import { colors } from "@minicollections/theme";

const Stack = createNativeStackNavigator<BrandsStackParamList>();

export default function BrandsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="BrandsList" component={BrandsScreen} />
      <Stack.Screen name="BrandObjects" component={BrandObjectsScreen} />
      <Stack.Screen name="BrandObjectDetail" component={BrandObjectDetailScreen} />
    </Stack.Navigator>
  );
}
