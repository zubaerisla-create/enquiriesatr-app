import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export async function getTokens(): Promise<StoredTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  return {
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? null,
  };
}

export async function setTokens(tokens: StoredTokens): Promise<void> {
  const tasks: Array<Promise<void>> = [];

  if (tokens.accessToken) {
    tasks.push(SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken));
  } else {
    tasks.push(SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY));
  }

  if (tokens.refreshToken) {
    tasks.push(SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken));
  } else {
    tasks.push(SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY));
  }

  await Promise.all(tasks);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
