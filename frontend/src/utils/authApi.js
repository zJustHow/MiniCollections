import { authHeaders, handleResponse, TOKEN_KEY } from "./apiClient";

export const login = async ({ identifier, password, loginType }) => {
  const body = { password };
  body[loginType === "phone" ? "phone" : "email"] = identifier;
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getWechatAuthUrl = async (platform = "pc") => {
  const response = await fetch(`/auth/wechat/url?platform=${platform}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const exchangeWechatCode = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const bindWechatAccount = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/bind", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ code, state }),
  });
  return handleResponse(response);
};

export const sendCode = async (target, type) => {
  const response = await fetch("/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, type }),
  });
  return handleResponse(response);
};

export const sendForgotPasswordCode = async (target, type) => {
  const response = await fetch("/forgot-password/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, type }),
  });
  return handleResponse(response);
};

export const resetPassword = async (data) => {
  const response = await fetch("/forgot-password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const signup = async (data) => {
  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
