/**
 * TourOverlay — Spotlight + tooltip del tour guiado de EcoClub.
 *
 *  - Oscurece la pantalla con 4 rectángulos alrededor del target (funciona en
 *    web y nativo sin SVG) y dibuja un borde verde sobre el elemento.
 *  - Las capas oscuras usan pointerEvents="none": el overlay nunca bloquea la
 *    UI; solo el tooltip captura toques.
 *  - Convierte las coordenadas de ventana del target a coordenadas locales
 *    restando el origen del propio overlay (necesario en web, donde la app
 *    vive dentro del marco de teléfono de WebPresentationContainer).
 *
 * Montar UNA vez, como hermano del navegador raíz, dentro de <TourProvider>.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useTour } from "../../contexts/TourContext";

const OVERLAY_COLOR = "rgba(0, 0, 0, 0.65)";
const HIGHLIGHT_BORDER = "#4ADE80";
const DEFAULT_PADDING = 8;
const TOOLTIP_EST_HEIGHT = 200;
const GAP = 14;
const EDGE = 12;

export default function TourOverlay() {
  const {
    isActive,
    status,
    stepIndex,
    steps,
    currentStep,
    targetLayout,
    nextStep,
    prevStep,
    skipTour,
    recalculateSpotlight,
  } = useTour();

  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltipH, setTooltipH] = useState(TOOLTIP_EST_HEIGHT);

  const [fade] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.94));
  const visible = isActive && status === "showing";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fade.setValue(0);
      scale.setValue(0.94);
    }
  }, [visible, stepIndex, fade, scale]);

  const onRootLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setSize({ width, height });
      rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y }));
      recalculateSpotlight();
    },
    [recalculateSpotlight],
  );

  if (!isActive || !currentStep || stepIndex === null) return null;

  const W = size.width;
  const H = size.height;
  const pad = currentStep.padding ?? DEFAULT_PADDING;

  // Rectángulo del target en coordenadas locales, recortado al overlay.
  // Durante el scroll el target puede quedar parcial o totalmente fuera.
  const spot =
    visible && targetLayout
      ? (() => {
          const left = Math.max(0, targetLayout.x - origin.x - pad);
          const top = Math.max(0, targetLayout.y - origin.y - pad);
          const right = Math.min(
            W,
            targetLayout.x - origin.x + targetLayout.width + pad,
          );
          const bottom = Math.min(
            H,
            targetLayout.y - origin.y + targetLayout.height + pad,
          );
          if (right <= left || bottom <= top) return null; // fuera de pantalla
          return { x: left, y: top, w: right - left, h: bottom - top };
        })()
      : null;

  // ── Posición del tooltip ──
  let tooltipTop = (H - tooltipH) / 2;
  if (spot && currentStep.tooltipPosition !== "center") {
    const below = spot.y + spot.h + GAP;
    const above = spot.y - GAP - tooltipH;
    const fitsBelow = below + tooltipH <= H - EDGE;
    const fitsAbove = above >= EDGE;
    const preferTop = currentStep.tooltipPosition === "top";

    if (preferTop ? fitsAbove : !fitsBelow && fitsAbove) tooltipTop = above;
    else if (fitsBelow) tooltipTop = below;
    else tooltipTop = H - tooltipH - EDGE; // target enorme: anclar abajo
  }
  tooltipTop = Math.max(EDGE, Math.min(tooltipTop, H - tooltipH - EDGE));

  const total = steps.length;
  const isLast = stepIndex === total - 1;

  return (
    // box-none: el overlay deja pasar toques y scroll a la pantalla de abajo;
    // solo el tooltip los captura.
    <View
      ref={rootRef}
      style={[StyleSheet.absoluteFill, styles.passThrough]}
      onLayout={onRootLayout}
    >
      {visible &&
        (spot ? (
          <>
            <View
              style={[
                styles.dim,
                { top: 0, left: 0, right: 0, height: spot.y },
              ]}
            />
            <View
              style={[
                styles.dim,
                { top: spot.y, left: 0, width: spot.x, height: spot.h },
              ]}
            />
            <View
              style={[
                styles.dim,
                {
                  top: spot.y,
                  left: spot.x + spot.w,
                  right: 0,
                  height: spot.h,
                },
              ]}
            />
            <View
              style={[
                styles.dim,
                { top: spot.y + spot.h, left: 0, right: 0, bottom: 0 },
              ]}
            />
            <View
              style={[
                styles.spotBorder,
                { top: spot.y, left: spot.x, width: spot.w, height: spot.h },
              ]}
            />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.dim]} />
        ))}

      {visible && (
        <Animated.View
          onLayout={(e) => setTooltipH(e.nativeEvent.layout.height)}
          style={[
            styles.tooltip,
            { top: tooltipTop, opacity: fade, transform: [{ scale }] },
          ]}
          accessibilityRole="alert"
        >
          <View style={styles.stepRow}>
            {steps.map((s, i) => (
              <View
                key={s.id}
                style={[styles.dot, i === stepIndex && styles.dotActive]}
              />
            ))}
            <Text style={styles.stepLabel}>
              Paso {stepIndex + 1} de {total}
            </Text>
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.desc}>{currentStep.description}</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={skipTour}
              style={styles.ghostBtn}
              accessibilityRole="button"
              accessibilityLabel="Saltar tour"
            >
              <Text style={styles.ghostText}>Saltar</Text>
            </TouchableOpacity>

            <View style={styles.btnRight}>
              {stepIndex > 0 && (
                <TouchableOpacity
                  onPress={prevStep}
                  style={styles.ghostBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.backText}>Atrás</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={nextStep}
                style={styles.nextBtn}
                accessibilityRole="button"
              >
                <Text style={styles.nextText}>
                  {isLast ? "¡Listo!" : "Siguiente"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: { pointerEvents: "box-none" },
  // Capas oscuras: no capturan toques ni rueda/scroll (pasan a la pantalla)
  dim: {
    position: "absolute",
    backgroundColor: OVERLAY_COLOR,
    pointerEvents: "none",
  },
  spotBorder: {
    position: "absolute",
    pointerEvents: "none",
    borderWidth: 2.5,
    borderColor: HIGHLIGHT_BORDER,
    borderRadius: 14,
    shadowColor: HIGHLIGHT_BORDER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  tooltip: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: "#277855", width: 18 },
  stepLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 4,
  },
  title: { fontSize: 17, fontWeight: "800", color: "#0A1C40", marginBottom: 6 },
  desc: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginBottom: 18 },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  ghostBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  ghostText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  backText: { fontSize: 14, color: "#277855", fontWeight: "700" },
  nextBtn: {
    backgroundColor: "#277855",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: "center",
  },
  nextText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});
