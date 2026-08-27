import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/ecoColors';

type Props = {
  value: number;      // ej. 5.2
  max: number;         // ej. 8
  unit?: string;        // ej. "kg CO2"
  size?: number;
  strokeWidth?: number;
};

export default function EcoGauge({
  value,
  max,
  unit = 'kg\nCO2',
  size = 200,
  strokeWidth = 16,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arco de 270° (dejamos 90° abiertos abajo, como un velocímetro)
  const arcRatio = 0.75;
  const arcLength = circumference * arcRatio;
  const progress = Math.min(value / max, 1);
  const progressLength = arcLength * progress;

  const rotation = 135; // punto de inicio del arco

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
  {/* Track de fondo */}
  <Circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke={colors.track}
    strokeWidth={strokeWidth}
    fill="none"
    strokeDasharray={`${arcLength}, ${circumference}`}
    strokeLinecap="round"
    transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
  />
  {/* Progreso */}
  <Circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke={colors.green}
    strokeWidth={strokeWidth}
    fill="none"
    strokeDasharray={`${progressLength}, ${circumference}`}
    strokeLinecap="round"
    transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
  />
</Svg>
      <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
        <View style={styles.center}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 32, fontWeight: '800', color: colors.black },
  unit: { fontSize: 20, fontWeight: '700', color: colors.black, textAlign: 'center' },
});