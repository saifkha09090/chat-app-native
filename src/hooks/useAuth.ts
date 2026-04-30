import { router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import {
    logout,
    resetPassword,
    signIn,
    signUp,
} from "../services/authServices";

const useAuth = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all fields",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, capitalizedName);

    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: error.message,
        position: "top",
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Signup successful.",
        position: "top",
        visibilityTime: 2000,
        onHide() {
          router.push("/(auth)/login");
        },
      });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Please enter both email and password.",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
        position: "top",
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Login successful.",
        position: "top",
        visibilityTime: 2000,
      });
      router.replace("/(main)");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email.",
        position: "bottom",
        keyboardOffset: 100,
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "bottom",
        keyboardOffset: 100,
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Password reset email has been sent. Please check your inbox.",
        position: "top",
        visibilityTime: 2000,
        onHide() {
          router.back();
        },
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await logout();

    if (error) {
      console.log("Logout Failed", error.message);
    } else {
      console.log("User logout successfully");
      router.replace("/(auth)/login");
    }
  };

  return {
    handleSignup,
    setEmail,
    setName,
    setPassword,
    name,
    email,
    password,
    loading,
    handleLogin,
    handleResetPassword,
    handleLogout,
  };
};

export default useAuth;
