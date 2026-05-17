import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    clearStoredTokens,
    deleteAccount,
    fetchMe,
    forgotPasswordRequest,
    forgotPasswordReset,
    forgotPasswordVerify,
    getStoredTokens,
    loginAccount,
    logoutAccount,
    registerAccount,
    resendVerificationCode,
    socialLoginApple,
    socialLoginGoogle,
    storeTokens,
    verifyEmail,
    type LoginResponse,
    type UserMe,
} from "../lib/auth";
import { signOutFromGoogle } from "../lib/googleAuth";

export type AuthState = {
    isBootstrapping: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: UserMe | null;
};

type AuthAction =
    | { type: "BOOTSTRAP_START" }
    | { type: "BOOTSTRAP_DONE"; payload: { user: UserMe | null; accessToken: string | null; refreshToken: string | null } }
    | { type: "SIGNED_IN"; payload: { user: UserMe; accessToken: string; refreshToken: string } }
    | { type: "SIGNED_OUT" };

const initialState: AuthState = {
    isBootstrapping: true,
    accessToken: null,
    refreshToken: null,
    user: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "BOOTSTRAP_START":
            return { ...state, isBootstrapping: true };
        case "BOOTSTRAP_DONE":
            return {
                isBootstrapping: false,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                user: action.payload.user,
            };
        case "SIGNED_IN":
            return {
                isBootstrapping: false,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                user: action.payload.user,
            };
        case "SIGNED_OUT":
            return {
                isBootstrapping: false,
                accessToken: null,
                refreshToken: null,
                user: null,
            };
        default:
            return state;
    }
}

export type AuthContextValue = AuthState & {
    loadSession: () => Promise<void>;
    register: (payload: { email: string; password: string; full_name?: string }) => Promise<void>;
    login: (payload: { email: string; password: string }) => Promise<LoginResponse>;
    loginWithGoogle: (payload: { id_token: string }) => Promise<void>;
    loginWithApple: (payload: { id_token: string; full_name?: string }) => Promise<void>;
    logout: () => Promise<void>;
    resendCode: (payload: { email: string }) => Promise<void>;
    verifyEmailCode: (payload: { email: string; code: string }) => Promise<void>;
    requestPasswordReset: (payload: { email: string }) => Promise<void>;
    verifyPasswordReset: (payload: { email: string; code: string }) => Promise<string>;
    resetPassword: (payload: { email: string; password_reset_token: string; new_password: string }) => Promise<void>;
    refreshUser: () => Promise<UserMe>;
    deleteUserAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const queryClient = useQueryClient();

    const loadSession = useCallback(async () => {
        dispatch({ type: "BOOTSTRAP_START" });
        const tokens = await getStoredTokens();

        if (!tokens.accessToken || !tokens.refreshToken) {
            dispatch({
                type: "BOOTSTRAP_DONE",
                payload: { user: null, accessToken: null, refreshToken: null },
            });
            return;
        }

        try {
            const user = await fetchMe();
            queryClient.setQueryData(["me"], user);
            dispatch({
                type: "BOOTSTRAP_DONE",
                payload: {
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch {
            await clearStoredTokens();
            queryClient.removeQueries({ queryKey: ["me"] });
            dispatch({
                type: "BOOTSTRAP_DONE",
                payload: { user: null, accessToken: null, refreshToken: null },
            });
        }
    }, [queryClient]);

    const register = useCallback(async (payload: { email: string; password: string; full_name?: string }) => {
        await registerAccount(payload);
    }, []);

    const login = useCallback(async (payload: { email: string; password: string }) => {
        const result = await loginAccount(payload);
        await storeTokens({ access: result.access, refresh: result.refresh });
        const user = await fetchMe();
        queryClient.setQueryData(["me"], user);
        dispatch({
            type: "SIGNED_IN",
            payload: { user, accessToken: result.access, refreshToken: result.refresh },
        });
        return result;
    }, [queryClient]);

    const loginWithGoogle = useCallback(async (payload: { id_token: string }) => {
        const result = await socialLoginGoogle(payload);
        await storeTokens({ access: result.access, refresh: result.refresh });
        const user = await fetchMe();
        queryClient.setQueryData(["me"], user);
        dispatch({
            type: "SIGNED_IN",
            payload: { user, accessToken: result.access, refreshToken: result.refresh },
        });
    }, [queryClient]);

    const loginWithApple = useCallback(async (payload: { id_token: string; full_name?: string }) => {
        const result = await socialLoginApple(payload);
        await storeTokens({ access: result.access, refresh: result.refresh });
        const user = await fetchMe();
        queryClient.setQueryData(["me"], user);
        dispatch({
            type: "SIGNED_IN",
            payload: { user, accessToken: result.access, refreshToken: result.refresh },
        });
    }, [queryClient]);

    const logout = useCallback(async () => {
        try {
            const { refreshToken } = await getStoredTokens();
            if (refreshToken) {
                await logoutAccount(refreshToken);
            }
        } catch {
            // Ignore API errors and clear local state.
        } finally {
            await signOutFromGoogle();
            await clearStoredTokens();
            queryClient.clear();
            dispatch({ type: "SIGNED_OUT" });
        }
    }, [queryClient]);

    const resendCode = useCallback(async (payload: { email: string }) => {
        await resendVerificationCode(payload);
    }, []);

    const verifyEmailCode = useCallback(async (payload: { email: string; code: string }) => {
        await verifyEmail(payload);
    }, []);

    const requestPasswordReset = useCallback(async (payload: { email: string }) => {
        await forgotPasswordRequest(payload);
    }, []);

    const verifyPasswordReset = useCallback(async (payload: { email: string; code: string }) => {
        const result = await forgotPasswordVerify(payload);
        return result.password_reset_token;
    }, []);

    const resetPassword = useCallback(async (payload: { email: string; password_reset_token: string; new_password: string }) => {
        await forgotPasswordReset(payload);
    }, []);

    const refreshUser = useCallback(async () => {
        const user = await fetchMe();
        const tokens = await getStoredTokens();
        queryClient.setQueryData(["me"], user);
        dispatch({
            type: "SIGNED_IN",
            payload: {
                user,
                accessToken: tokens.accessToken ?? state.accessToken ?? "",
                refreshToken: tokens.refreshToken ?? state.refreshToken ?? "",
            },
        });
        return user;
    }, [queryClient, state.accessToken, state.refreshToken]);

    const deleteUserAccount = useCallback(async () => {
        try {
            await deleteAccount();
        } finally {
            await signOutFromGoogle();
            await clearStoredTokens();
            queryClient.clear();
            dispatch({ type: "SIGNED_OUT" });
        }
    }, [queryClient]);

    const value = useMemo(
        () => ({
            ...state,
            loadSession,
            register,
            login,
            loginWithGoogle,
            loginWithApple,
            logout,
            resendCode,
            verifyEmailCode,
            requestPasswordReset,
            verifyPasswordReset,
            resetPassword,
            refreshUser,
            deleteUserAccount,
        }),
        [
            state,
            loadSession,
            register,
            login,
            loginWithGoogle,
            loginWithApple,
            logout,
            resendCode,
            verifyEmailCode,
            requestPasswordReset,
            verifyPasswordReset,
            resetPassword,
            refreshUser,
            deleteUserAccount,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
