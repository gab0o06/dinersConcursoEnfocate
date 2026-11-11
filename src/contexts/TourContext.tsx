/**
 * TourContext — Coordinador central del tour guiado interactivo de EcoClub
 *
 * Responsabilidades:
 *  1. Mantener el paso actual del tour (null = inactivo)
 *  2. Registrar refs de los elementos a resaltar (por nativeID)
 *  3. Coordinar la navegación antes de cada paso
 *  4. Medir la posición/tamaño del elemento target en pantalla
 *  5. Exponer el layout medido para que TourOverlay renderice el spotlight
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type View } from "react-native";
import { useRouter } from "expo-router";
import { TOUR_STEPS, type TourStep } from "../config/tourSteps";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourContextValue {
  /** Paso actual (1-based). null = tour inactivo */
  currentStep: number | null;
  /** Definición completa del paso actual */
  currentStepDef: TourStep | null;
  /** Layout medido del elemento target, o null si aún no se midió */
  targetLayout: TargetLayout | null;
  /** true mientras se está navegando/esperando que el elemento aparezca */
  isTransitioning: boolean;

  /** Iniciar el tour desde el paso 1 */
  startTour: () => void;
  /** Avanzar al siguiente paso */
  nextStep: () => void;
  /** Finalizar el tour en cualquier momento */
  skipTour: () => void;

  /** Registrar un ref de View asociado a un nativeID */
  registerRef: (id: string, ref: React.RefObject<View>) => void;
  /** Remover un ref (cuando el componente se desmonta) */
  unregisterRef: (id: string) => void;
  /** Forzar una nueva medición del target actual */
  remeasure: () => void;
}

// ---------------------------------------------------------------------------
// Context y hook
// ---------------------------------------------------------------------------

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Tiempo de espera (ms) después de navegar antes de intentar medir el target */
const NAVIGATION_SETTLE_MS = 450;
/** Reintentos máximos de medición si el elemento no está disponible aún */
const MEASURE_RETRIES = 6;
const MEASURE_RETRY_DELAY_MS = 150;

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /** Map de nativeID → ref */
  const refsMap = useRef<Map<string, React.RefObject<View>>>(new Map());

  // ---------------------------------------------------------------------------
  // Ref registration
  // ---------------------------------------------------------------------------

  const registerRef = useCallback(
    (id: string, ref: React.RefObject<View>) => {
      refsMap.current.set(id, ref);
    },
    []
  );

  const unregisterRef = useCallback((id: string) => {
    refsMap.current.delete(id);
  }, []);

  // ---------------------------------------------------------------------------
  // Measure
  // ---------------------------------------------------------------------------

  const measureTarget = useCallback(
    (targetId: string, retriesLeft: number = MEASURE_RETRIES): void => {
      const ref = refsMap.current.get(targetId);
      if (!ref?.current) {
        if (retriesLeft > 0) {
          setTimeout(
            () => measureTarget(targetId, retriesLeft - 1),
            MEASURE_RETRY_DELAY_MS
          );
        } else {
          // El elemento no apareció — igualmente mostramos el overlay sin spotlight
          setTargetLayout(null);
          setIsTransitioning(false);
        }
        return;
      }

      ref.current.measureInWindow((x, y, width, height) => {
        if (width === 0 && height === 0 && retriesLeft > 0) {
          // measureInWindow devolvió ceros → todavía no está en pantalla
          setTimeout(
            () => measureTarget(targetId, retriesLeft - 1),
            MEASURE_RETRY_DELAY_MS
          );
          return;
        }
        setTargetLayout({ x, y, width, height });
        setIsTransitioning(false);
      });
    },
    []
  );

  const remeasure = useCallback(() => {
    if (currentStep === null) return;
    const stepDef = TOUR_STEPS.find((s) => s.id === currentStep);
    if (stepDef) measureTarget(stepDef.targetId);
  }, [currentStep, measureTarget]);

  // ---------------------------------------------------------------------------
  // Navigation helper
  // ---------------------------------------------------------------------------

  const goToStep = useCallback(
    (step: number) => {
      const stepDef = TOUR_STEPS.find((s) => s.id === step);
      if (!stepDef) return;

      setIsTransitioning(true);
      setTargetLayout(null);
      setCurrentStep(step);

      // Navegar a la pantalla correcta, luego esperar que se asiente y medir
      stepDef.navigate(router);

      setTimeout(() => {
        measureTarget(stepDef.targetId);
      }, NAVIGATION_SETTLE_MS);
    },
    [router, measureTarget]
  );

  // ---------------------------------------------------------------------------
  // Public actions
  // ---------------------------------------------------------------------------

  const startTour = useCallback(() => {
    goToStep(1);
  }, [goToStep]);

  const nextStep = useCallback(() => {
    if (currentStep === null) return;
    const nextIdx = currentStep + 1;
    if (nextIdx > TOUR_STEPS.length) {
      skipTour();
      return;
    }
    goToStep(nextIdx);
  }, [currentStep, goToStep]);

  const skipTour = useCallback(() => {
    setCurrentStep(null);
    setTargetLayout(null);
    setIsTransitioning(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Value
  // ---------------------------------------------------------------------------

  const currentStepDef =
    currentStep !== null
      ? (TOUR_STEPS.find((s) => s.id === currentStep) ?? null)
      : null;

  const value: TourContextValue = {
    currentStep,
    currentStepDef,
    targetLayout,
    isTransitioning,
    startTour,
    nextStep,
    skipTour,
    registerRef,
    unregisterRef,
    remeasure,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
