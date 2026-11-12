/**
 * useTourScroll — Conecta un ScrollView / FlatList al tour guiado para que el
 * spotlight siga al elemento resaltado mientras el usuario hace scroll.
 *
 * Uso:
 *   const tourScroll = useTourScroll();
 *   <ScrollView {...tourScroll}>…</ScrollView>
 *
 * Cada evento (scroll a ~60 fps, cambio de layout o de tamaño de contenido)
 * llama a recalculateSpotlight(), que mide como mucho una vez por frame y no
 * hace nada si el tour está inactivo. Las props son estables: no provocan
 * re-renders de la pantalla.
 */

import { useMemo } from "react";
import { useTourActions } from "../contexts/TourContext";

export function useTourScroll() {
  const { recalculateSpotlight } = useTourActions();

  return useMemo(
    () => ({
      onScroll: recalculateSpotlight,
      scrollEventThrottle: 16,
      onLayout: recalculateSpotlight,
      onContentSizeChange: recalculateSpotlight,
    }),
    [recalculateSpotlight],
  );
}
