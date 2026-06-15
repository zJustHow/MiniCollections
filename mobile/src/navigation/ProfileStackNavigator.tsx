import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import AdminSubmissionsScreen from "../screens/AdminSubmissionsScreen";
import type { ProfileStackParamList } from "./types";
import { useTabStackScreenOptions } from "./useTabStackScreenOptions";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="AdminSubmissions" component={AdminSubmissionsScreen} />
    </Stack.Navigator>
  );
}
