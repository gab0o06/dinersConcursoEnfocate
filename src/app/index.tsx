import { Redirect } from "expo-router";

/**
 * Redirige automáticamente al Home principal sin mostrar pantalla de login.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
