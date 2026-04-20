import { Redirect, Stack } from "expo-router";
import * as splashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/supabase";

splashScreen.preventAutoHideAsync();
const RootLayout = () => {
  const [isLogin, setIsLogin] = useState(false);

  const getUser = async () => {
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  };

  useEffect(() => {
    splashScreen.hideAsync();
    getUser();
  }, []);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isLogin ? <Redirect href={"/(main)"} /> : <Redirect href={"/(auth)"} />}
    </>
  );
};

export default RootLayout;
