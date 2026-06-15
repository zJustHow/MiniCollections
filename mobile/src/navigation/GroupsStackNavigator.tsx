import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/GroupsScreen";
import GroupObjectsScreen from "../screens/GroupObjectsScreen";
import GroupObjectDetailScreen from "../screens/GroupObjectDetailScreen";
import type { GroupsStackParamList } from "./types";
import { useTabStackScreenOptions } from "./useTabStackScreenOptions";

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsStackNavigator() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupObjects" component={GroupObjectsScreen} />
      <Stack.Screen name="GroupObjectDetail" component={GroupObjectDetailScreen} />
    </Stack.Navigator>
  );
}
