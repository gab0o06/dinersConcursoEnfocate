/**
 * useTourHighlight — Registra un View como target del tour guiado.
 *
 * Uso:
 *   const tourTarget = useTourHighlight("home-weekly-achievement");
 *   <View {...tourTarget}>…</View>
 *
 * Devuelve { ref, nativeID, collapsable } listo para esparcir en un <View>:
 *  - ref:         lo usa TourContext para medir con measureInWindow
 *  - nativeID:    identificador reconocible (también útil para tests / web id)
 *  - collapsable: false para que Android no aplane el View y siga siendo medible
 */

import { useEffect, useRef } from "react";
import { type View } from "react-native";
import { useTour } from "../contexts/TourContext";

export function useTourHighlight(id: string) {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget } = useTour();

  useEffect(() => {
    registerTarget(id, ref);
    return () => unregisterTarget(id, ref);
  }, [id, registerTarget, unregisterTarget]);

  return { ref, nativeID: id, collapsable: false } as const;
}
