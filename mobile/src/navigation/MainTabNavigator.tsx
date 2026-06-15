import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import BrandsStackNavigator from "./BrandsStackNavigator";
import GroupsStackNavigator from "./GroupsStackNavigator";
import StatsStackNavigator from "./StatsStackNavigator";
import FeedbackStackNavigator from "./FeedbackStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import type { MainTabParamList, RootStackParamList } from "./types";
import { openLogin } from "./openLogin";
import { colors, neuRaisedUp, neuFontFamily, neuFontSize } from "@minicollections/theme";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator<MainTabParamList>();

export type MainTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function MainTabNavigator() {
  const { authed } = useAuth();
  const { t } = useLocale();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 0,
          ...neuRaisedUp("sm"),
        },
        tabBarLabelStyle: {
          fontFamily: neuFontFamily.regular,
          fontSize: neuFontSize.fs12,
        },
      }}
    >
      <Tab.Screen
        name="BrandsTab"
        component={BrandsStackNavigator}
        options={{
          title: t("brands"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            if (!authed) {
              event.preventDefault();
              openLogin(navigation.getParent(), { returnTab: "GroupsTab" });
            }
          },
        })}
        options={{
          title: t("groups"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            if (!authed) {
              event.preventDefault();
              openLogin(navigation.getParent(), { returnTab: "StatsTab" });
            }
          },
        })}
        options={{
          title: t("stats"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FeedbackTab"
        component={FeedbackStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            if (!authed) {
              event.preventDefault();
              openLogin(navigation.getParent(), { returnTab: "FeedbackTab" });
            }
          },
        })}
        options={{
          title: t("feedback"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
