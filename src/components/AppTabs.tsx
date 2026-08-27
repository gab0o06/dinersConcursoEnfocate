import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Aquí defines home, wallet, ecoclub y menu como lo vimos antes */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Billetera",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ecoclub"
        options={{
          title: "EcoClub",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="leaf" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menú",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
