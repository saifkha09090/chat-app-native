import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../utils/supabase/supabase";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [isLogin, setIsLogin] = useState(false);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
    await SplashScreen.hideAsync();
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      {isLogin ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />}
      <Toast />
    </ThemeProvider>
  );
};

export default RootLayout;
