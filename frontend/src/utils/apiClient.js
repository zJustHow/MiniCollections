import {
  configureApi,
  TOKEN_KEY,
  setCurrentLocale,
  getToken,
  authHeaders,
  parseApiError,
  handleResponse,
  handleDeleteResponse,
  fetchAllPages,
  buildPageParams,
  PAGE_SIZE,
  SKELETON_CARD_COUNT,
  FEEDBACK_PAGE_SIZE,
} from "@minicollections/api";

const webStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

configureApi({ baseUrl: "", storage: webStorage });

export {
  TOKEN_KEY,
  PAGE_SIZE,
  SKELETON_CARD_COUNT,
  FEEDBACK_PAGE_SIZE,
  setCurrentLocale,
  getToken,
  authHeaders,
  parseApiError,
  handleResponse,
  handleDeleteResponse,
  fetchAllPages,
  buildPageParams,
};
