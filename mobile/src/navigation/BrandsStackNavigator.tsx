import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrandsScreen from "../screens/BrandsScreen";
import BrandObjectsScreen from "../screens/BrandObjectsScreen";
import BrandObjectDetailScreen from "../screens/BrandObjectDetailScreen";
import type { BrandsStackParamList } from "./types";
import { useTabStackScreenOptions } from "./useTabStackScreenOptions";

const Stack = createNativeStackNavigator<BrandsStackParamList>();

export default function BrandsStackNavigator() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BrandsList" component={BrandsScreen} />
      <Stack.Screen name="BrandObjects" component={BrandObjectsScreen} />
      <Stack.Screen name="BrandObjectDetail" component={BrandObjectDetailScreen} />
    </Stack.Navigator>
  );
}
