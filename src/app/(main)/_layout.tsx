import MenuComp from "@/src/components/menu/MenuComp";
import BottomNav from "@/src/components/navigation/BottomNav";
import { router, Stack, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const pathname = usePathname();

  const showBottomNav =
    pathname === "/" || pathname === "/calls" || pathname === "/status";
  return (
    <PaperProvider>
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: "#000" }}
      >
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#000",
            },
            headerShadowVisible: false,
            animation: "none",
            contentStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Chap App",
              headerRight: () => <MenuComp />,
            }}
          />

          <Stack.Screen
            name="chatScreen"
            options={({ route }: any) => ({
              headerBackTitleVisible: false,
              headerShadowVisible: true,
              headerTitle: () => (
                <TouchableOpacity
                  style={{
                    marginLeft: -15,
                  }}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/otherUserProfile",
                      params: {
                        name: route.params?.name,
                        uri: route.params?.avatar,
                        email: route.params?.email,
                      },
                    })
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: route.params?.avatar }}
                      style={{
                        width: 35,
                        height: 35,
                        marginRight: 12,
                        borderRadius: 25,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#fff",
                        textTransform: "capitalize",
                      }}
                    >
                      {route.params?.name || "Chat"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            })}
          />

          <Stack.Screen name="userSearch" options={{ title: "Search" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="imageView" options={{ headerShown: false }} />
          <Stack.Screen name="calls" options={{ title: "Calls" }} />
          <Stack.Screen name="status" options={{ title: "Status" }} />
          <Stack.Screen name="otherUserProfile" options={{ title: "" }} />
          <Stack.Screen
            name="createGroup"
            options={{ title: "Create Group" }}
          />
        </Stack>

        {showBottomNav && <BottomNav />}
      </SafeAreaView>
    </PaperProvider>
  );
}
