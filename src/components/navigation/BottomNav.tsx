import { router, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const BottomNav = () => {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Messages",
      icon: "chat",
      route: "/",
    },
    {
      name: "Status",
      icon: "donut-large",
      route: "/status",
    },
    {
      name: "Calls",
      icon: "call",
      route: "/calls",
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab: any, index) => {
        const isActive = pathname === tab.route;

        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => router.replace(tab.route)}
          >
            <MaterialIcons
              name={tab.icon}
              size={26}
              color={isActive ? "#00A884" : "#8696A0"}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#000",
    borderTopWidth: 0.5,
    borderTopColor: "#222",
    height: 65,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#8696A0",
    marginTop: 3,
  },
  activeLabel: {
    color: "#00A884",
  },
});
export default BottomNav;
