import { api } from "./api";
import { setTokens, clearTokens, getTokens } from "./storage";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type LoginResponse = AuthTokens & {
  user_id: number;
  email: string;
  is_email_verified?: boolean;
};

export type SocialLoginResponse = AuthTokens & {
  user_id: number;
  email: string;
  is_new_user: boolean;
};

export type RegisterResponse = {
  id: number;
  email: string;
  is_email_verified: boolean;
  message: string;
};

export type VerifyEmailResponse = {
  message: string;
  is_email_verified: boolean;
};

export type UserMe = {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  has_active_sub?: boolean;
  subscription?: {
    plan_name: string;
    plan_slug: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  };
};

export async function registerAccount(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register/", payload);
  return response.data;
}

export async function loginAccount(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login/", payload);
  return response.data;
}

export async function logoutAccount(refreshToken: string): Promise<void> {
  await api.post("/auth/logout/", { refresh: refreshToken }, { requireAuth: true });
}

export async function verifyEmail(payload: {
  email: string;
  code: string;
}): Promise<VerifyEmailResponse> {
  const response = await api.post<VerifyEmailResponse>("/auth/email/verify/", payload);
  return response.data;
}

export async function resendVerificationCode(payload: { email: string }): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/email/resend/", payload);
  return response.data;
}

export async function fetchMe(): Promise<UserMe> {
  const response = await api.get<UserMe>("/users/me/", { requireAuth: true });
  return response.data;
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/users/me/delete/", { requireAuth: true });
}

export async function storeTokens(tokens: AuthTokens): Promise<void> {
  await setTokens({ accessToken: tokens.access, refreshToken: tokens.refresh });
}

export async function clearStoredTokens(): Promise<void> {
  await clearTokens();
}

export async function getStoredTokens() {
  return getTokens();
}

export async function forgotPasswordRequest(payload: { email: string }): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/forgot-password/request/", payload);
  return response.data;
}

export async function forgotPasswordVerify(payload: {
  email: string;
  code: string;
}): Promise<{ message: string; password_reset_token: string }> {
  const response = await api.post<{ message: string; password_reset_token: string }>(
    "/auth/forgot-password/verify/",
    payload
  );
  return response.data;
}

export async function forgotPasswordReset(payload: {
  email: string;
  password_reset_token: string;
  new_password: string;
}): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/forgot-password/reset/", payload);
  return response.data;
}

export async function socialLoginGoogle(payload: { id_token: string }): Promise<SocialLoginResponse> {
  const response = await api.post<SocialLoginResponse>("/auth/social/google/", payload);
  return response.data;
}

export async function socialLoginApple(payload: {
  id_token: string;
  full_name?: string;
}): Promise<SocialLoginResponse> {
  const response = await api.post<SocialLoginResponse>("/auth/social/apple/", payload);
  return response.data;
}

