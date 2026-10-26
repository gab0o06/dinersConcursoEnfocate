export const CSolors = {
  green: "#1B7A4B",
  greenDark: "#0F5C38",
  greenLight: "#E8F3ED",
  gray: "#6B7280",
  grayLight: "#F2F2F2",
  grayMedium: "#9CA3AF",
  navy: "#0B1F4B",
  blue: "#1E40FF",
  white: "#FFFFFF",
  black: "#111111",
  track: "#D9D9D9",
};

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const COLORS = {
  // Brand principal
  dinersBlue: "#0A1C40",
  dinersBlueLight: "#183A82",

  // EcoClub
  ecoGreen: "#1E754C",
  ecoGreenLight: "#A2C7B4",

  // Fondos y Superficies
  background: "#FFFFFF",
  cardBackground: "#F7F2EE", // Tono crema del Tab Bar

  // Texto
  textPrimary: "#111111",
  textSecondary: "#666666",

  // Extras
  border: "#EAEAEA",
  warningRed: "#D32F2F",
};

export const SIZES = {
  padding: 16,
  borderRadius: 20,
};
