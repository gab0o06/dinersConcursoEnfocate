/**
 * useTourHighlight — Hook para registrar un elemento como target del tour
 *
 * Uso:
 *   const ref = useTourHighlight("home-weekly-achievement");
 *   <View ref={ref} nativeID="home-weekly-achievement">...</View>
 *
 * Registra automáticamente el ref en el TourContext al montar el componente
 * y lo elimina al desmontar.
 */

import { useEffect, useRef, type RefObject } from "react";
import { type View } from "react-native";
import { useTour } from "../contexts/TourContext";

export function useTourHighlight(id: string): RefObject<View> {
  const ref = useRef<View>(null);
  const { registerRef, unregisterRef } = useTour();

  useEffect(() => {
    registerRef(id, ref);
    return () => {
      unregisterRef(id);
    };
  }, [id, registerRef, unregisterRef]);

  return ref;
}
