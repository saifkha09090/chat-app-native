import { Redirect, Stack } from "expo-router";
import * as splashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

splashScreen.preventAutoHideAsync();
const RootLayout = () => {
  const [isLogin, setIsLogin] = useState(true);
  useEffect(() => {
    splashScreen.hideAsync();
  }, []);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isLogin ? <Redirect href={"/(main)"} /> : <Redirect href={"/(auth)"} />}
    </>
  );
};

export default RootLayout;
