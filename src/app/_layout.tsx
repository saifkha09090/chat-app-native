import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { getCurrentUser } from "../services/authServices";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [isLogin, setIsLogin] = useState(false);

  const getUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
    await SplashScreen.hideAsync();
  };

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "green", backgroundColor: "#333" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 15, fontWeight: "400", color: "#fff" }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "red", backgroundColor: "#333" }}
        text1Style={{ color: "white" }}
      />
    ),
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      {isLogin ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />}
      <Toast config={toastConfig} visibilityTime={2000} />
    </ThemeProvider>
  );
};

export default RootLayout;
