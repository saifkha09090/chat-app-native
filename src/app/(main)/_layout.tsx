import { Stack } from "expo-router";

const MainStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      {/* <Stack.Screen name="login" /> */}
      {/* <Stack.Screen name="verify_otp" /> */}
    </Stack>
  );
};

export default MainStack;
