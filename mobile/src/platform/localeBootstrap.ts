import { setCurrentLocale } from "@minicollections/api";
import { resolveDeviceLocale, type AppLocale } from "../utils/deviceLocale";

export const INITIAL_APP_LOCALE: AppLocale = resolveDeviceLocale();

setCurrentLocale(INITIAL_APP_LOCALE);
