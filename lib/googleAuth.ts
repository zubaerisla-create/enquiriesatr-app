import { Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

let isConfigured = false;

function getWebClientId(): string {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
    if (!webClientId) {
        throw new Error("Google sign-in is not configured.");
    }
    return webClientId;
}

export function configureGoogleSignIn(): void {
    if (isConfigured) {
        return;
    }

    GoogleSignin.configure({
        webClientId: getWebClientId(),
    });

    isConfigured = true;
}

export async function signInWithGoogle(): Promise<{ idToken: string }> {
    if (Platform.OS === "web") {
        throw new Error("Google sign-in is only available in the native app.");
    }

    configureGoogleSignIn();

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();

    if (result.type !== "success") {
        throw new Error("Google sign-in was cancelled.");
    }

    const idToken = result.data.idToken;
    if (!idToken) {
        throw new Error("Google sign-in did not return a token.");
    }

    return { idToken };
}

export function isGoogleSignInCancelled(error: unknown): boolean {
    return Boolean(
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === statusCodes.SIGN_IN_CANCELLED
    );
}

export async function signOutFromGoogle(): Promise<void> {
    try {
        configureGoogleSignIn();
        await GoogleSignin.signOut();
    } catch (error) {
        // Ignore sign-out errors
    }
}

