import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Almacenamiento seguro compatible tanto con móvil (SecureStore) como con Web (localStorage).
 * Previene caídas en el navegador durante la defensa o pitch.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Fallback silencioso en entornos restringidos
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Fallback silencioso
  }
}
