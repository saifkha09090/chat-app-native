import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#292F3F",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "WhatsApp",
          headerRight: () => (
            <TouchableOpacity
              style={{ paddingTop: 5 }}
              onPress={() => router.push("/(main)/profile")}
            >
              <FontAwesome5 name="user-circle" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="chatScreen"
        options={({ route }: any) => ({
          title: route.params?.name || "Chat",
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen name="userSearch" options={{ title: "Search" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
