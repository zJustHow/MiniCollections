import type { NavigatorScreenParams } from "@react-navigation/native";

export type BrandsStackParamList = {
  BrandsList: undefined;
  BrandObjects: {
    brandId: string;
    brandName?: string;
  };
  BrandObjectDetail: {
    brandId: string;
    brandName?: string;
    objectId: string;
    objectName?: string;
  };
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupObjects: {
    groupId: string;
    groupName?: string;
  };
  GroupObjectDetail: {
    groupId: string;
    objectId: string;
    objectName?: string;
  };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  AdminSubmissions: undefined;
};

export type StatsStackParamList = {
  StatsHome: undefined;
};

export type FeedbackStackParamList = {
  FeedbackHome:
    | {
        openSubmit?: boolean;
        brandId?: string;
        brandName?: string;
        submissionType?: "MISSING_MODEL" | "BUG_REPORT" | "DATA_CORRECTION";
        initialNameEn?: string;
      }
    | undefined;
};

export type MainTabParamList = {
  BrandsTab: NavigatorScreenParams<BrandsStackParamList>;
  GroupsTab: NavigatorScreenParams<GroupsStackParamList>;
  StatsTab: NavigatorScreenParams<StatsStackParamList>;
  FeedbackTab: NavigatorScreenParams<FeedbackStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Login: { returnTab?: keyof MainTabParamList } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
