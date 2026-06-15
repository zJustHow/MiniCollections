import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/providers/AuthProvider";
import FontProvider from "./src/providers/FontProvider";
import { LocaleProvider } from "./src/providers/LocaleProvider";
import ProfileLocaleSync from "./src/components/ProfileLocaleSync";
import RootNavigator from "./src/navigation/RootNavigator";
import { INITIAL_APP_LOCALE } from "./src/platform/localeBootstrap";

export default function App() {
  return (
    <SafeAreaProvider>
      <FontProvider>
        <LocaleProvider initialLocale={INITIAL_APP_LOCALE}>
          <AuthProvider>
            <ProfileLocaleSync />
            <RootNavigator />
            <StatusBar style="dark" />
          </AuthProvider>
        </LocaleProvider>
      </FontProvider>
    </SafeAreaProvider>
  );
}
