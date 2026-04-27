import MenuComp from "@/src/components/menu/MenuComp";
import { router, Stack } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { PaperProvider } from "react-native-paper";

export default function Layout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#111B21",
          },
          headerShadowVisible: false,
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
        <Stack.Screen name="otherUserProfile" options={{ title: "" }} />
      </Stack>
    </PaperProvider>
  );
}
