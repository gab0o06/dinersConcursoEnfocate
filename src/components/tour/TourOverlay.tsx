/**
 * TourOverlay — Overlay de spotlight para el tour guiado de EcoClub
 *
 * Renderiza:
 *  1. Fondo semi-transparente en 4 rectángulos alrededor del elemento target
 *     (técnica de "4 rectángulos" = funciona en web y nativo sin SVG)
 *  2. Borde verde brillante sobre el elemento resaltado
 *  3. Tooltip con título, descripción y botones Siguiente / Saltar
 *
 * Debe montarse UNA vez en el root layout, dentro de <TourProvider>.
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTour } from "../../contexts/TourContext";
import { TOUR_STEPS } from "../../config/tourSteps";

const OVERLAY_COLOR = "rgba(0, 0, 0, 0.65)";
const HIGHLIGHT_BORDER = "#4ADE80"; // green-400
const PADDING = 8; // default spotlight padding

export default function TourOverlay() {
  const {
    currentStep,
    currentStepDef,
    targetLayout,
    isTransitioning,
    nextStep,
    skipTour,
  } = useTour();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const isActive = currentStep !== null;

  // Fade in when step changes
  useEffect(() => {
    if (isActive && !isTransitioning) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [currentStep, isTransitioning]);

  if (!isActive || isTransitioning) return null;

  const { width: W, height: H } = Dimensions.get("window");
  const pad = currentStepDef?.padding ?? PADDING;

  // Spotlight rectangle (with padding)
  const spot = targetLayout
    ? {
        x: Math.max(0, targetLayout.x - pad),
        y: Math.max(0, targetLayout.y - pad),
        w: targetLayout.width + pad * 2,
        h: targetLayout.height + pad * 2,
      }
    : null;

  const isLastStep = currentStep === TOUR_STEPS.length;
  const stepLabel = `Paso ${currentStep} de ${TOUR_STEPS.length}`;

  // Decide tooltip position: below spotlight, or above if near bottom
  const tooltipBelow = spot ? spot.y + spot.h + 20 + 150 < H : true;
  const tooltipTop = spot
    ? tooltipBelow
      ? spot.y + spot.h + 16
      : spot.y - 170
    : H / 2 - 75;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ── 4-rectangle overlay ── */}
      {spot ? (
        <>
          {/* Top */}
          <View
            style={[
              styles.overlay,
              { top: 0, left: 0, right: 0, height: spot.y },
            ]}
            pointerEvents="none"
          />
          {/* Left */}
          <View
            style={[
              styles.overlay,
              {
                top: spot.y,
                left: 0,
                width: spot.x,
                height: spot.h,
              },
            ]}
            pointerEvents="none"
          />
          {/* Right */}
          <View
            style={[
              styles.overlay,
              {
                top: spot.y,
                left: spot.x + spot.w,
                right: 0,
                height: spot.h,
              },
            ]}
            pointerEvents="none"
          />
          {/* Bottom */}
          <View
            style={[
              styles.overlay,
              {
                top: spot.y + spot.h,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            pointerEvents="none"
          />

          {/* Spotlight border */}
          <View
            style={[
              styles.spotlightBorder,
              {
                top: spot.y,
                left: spot.x,
                width: spot.w,
                height: spot.h,
              },
            ]}
            pointerEvents="none"
          />
        </>
      ) : (
        // No target → full dim
        <View
          style={[styles.overlay, StyleSheet.absoluteFill]}
          pointerEvents="none"
        />
      )}

      {/* ── Tooltip ── */}
      <Animated.View
        style={[
          styles.tooltip,
          {
            top: tooltipTop,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {TOUR_STEPS.map((s) => (
            <View
              key={s.id}
              style={[
                styles.stepDot,
                s.id === currentStep && styles.stepDotActive,
              ]}
            />
          ))}
          <Text style={styles.stepLabel}>{stepLabel}</Text>
        </View>

        <Text style={styles.tooltipTitle}>{currentStepDef?.title}</Text>
        <Text style={styles.tooltipDesc}>{currentStepDef?.description}</Text>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={skipTour}>
            <Text style={styles.skipBtnText}>Saltar tour</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
            <Text style={styles.nextBtnText}>
              {isLastStep ? "¡Listo! 🎉" : "Siguiente →"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    backgroundColor: OVERLAY_COLOR,
  },
  spotlightBorder: {
    position: "absolute",
    borderWidth: 2.5,
    borderColor: HIGHLIGHT_BORDER,
    borderRadius: 14,
    // subtle glow via shadow
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
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  stepDotActive: {
    backgroundColor: "#277855",
    width: 18,
  },
  stepLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    marginLeft: 4,
  },
  tooltipTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0A1C40",
    marginBottom: 6,
  },
  tooltipDesc: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 18,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipBtnText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#277855",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
