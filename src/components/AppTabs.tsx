import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  // Margen inferior seguro: mínimo 26px en web/simulador para librar el marco y el home indicator
  const bottomInset = Math.max(insets.bottom, isWeb ? 26 : 22);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#15803D",
        tabBarInactiveTintColor: "#334155",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={focused ? "#15803D" : "#475569"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              Inicio
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
          title: "Billetera",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={22}
              color={focused ? "#15803D" : "#475569"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ecoclub"
        options={{
          title: "EcoClub",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="leaf"
              size={19}
              color={focused ? "#15803D" : "#475569"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              EcoClub
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menú",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={focused ? "#15803D" : "#475569"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              Menú
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569", // Gris oscuro pizarra legible, nunca blanco
    marginTop: 2,
    marginBottom: 2,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#15803D", // Verde EcoClub destacado
    fontWeight: "800",
  },
});
