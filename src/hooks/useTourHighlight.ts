/**
 * useTourHighlight — Registra un View como target del tour guiado.
 *
 * Uso:
 *   const tourTarget = useTourHighlight("home-weekly-achievement");
 *   <View {...tourTarget}>…</View>
 *
 * Devuelve props listas para esparcir en un <View> (o Touchable):
 *  - ref:         lo usa TourContext para medir con measureInWindow
 *  - nativeID:    identificador reconocible (también útil para tests / web id)
 *  - collapsable: false para que Android no aplane el View y siga siendo medible
 *  - onLayout:    si el target cambia de tamaño/posición, el spotlight lo sigue
 *
 * Usa el contexto estable de acciones: la pantalla NO se re-renderiza cuando
 * se mueve el spotlight.
 */

import { useEffect, useRef } from "react";
import { type View } from "react-native";
import { useTourActions } from "../contexts/TourContext";

export function useTourHighlight(id: string) {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget, recalculateSpotlight } =
    useTourActions();

  useEffect(() => {
    registerTarget(id, ref);
    return () => unregisterTarget(id, ref);
  }, [id, registerTarget, unregisterTarget]);

  return {
    ref,
    nativeID: id,
    collapsable: false,
    onLayout: recalculateSpotlight,
  } as const;
}
