import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  value: number;
  max: number;
};

export default function EcoGauge({ value, max }: Props) {
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Queremos que el círculo ocupe 270 grados (dejando un hueco de 90 grados abajo)
  const angle = 270;
  const arcLength = (circumference * angle) / 360;

  // Cálculo del progreso actual
  const progressRatio = Math.min(value / max, 1);
  const strokeDashoffset = arcLength - arcLength * progressRatio;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        {/* Pista de fondo (Gris) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8A8A8A" // Gris del diseño
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          rotation={135} // Rotamos para que el hueco quede simétrico abajo
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
        {/* Pista de progreso (Verde) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E754C" // Verde EcoClub
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={circumference - arcLength + strokeDashoffset}
          rotation={135}
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
      </Svg>

      {/* Contenido Central */}
      <View style={styles.centerContent}>
        <Text style={styles.valueText}>{value} kg</Text>
        <View style={styles.co2Container}>
          <Text style={styles.co2Text}>CO</Text>
          <Text style={styles.subscript}>2</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
  co2Container: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  co2Text: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  subscript: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
    marginBottom: -2, // Baja el "2" para simular subíndice
  },
});
