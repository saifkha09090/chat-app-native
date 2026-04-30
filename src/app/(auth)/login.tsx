import ButtonComp from "@/src/components/btn/ButtonComp";
import useAuth from "@/src/hooks/useAuth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const Login = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const { setEmail, email, password, setPassword, handleLogin, loading } =
    useAuth();

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Please enter both email and password.",
  //       position: "top",
  //       visibilityTime: 2000,
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email: email,
  //     password: password,
  //   });

  //   setLoading(false);

  //   if (error) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Login Failed",
  //       text2: error.message,
  //       position: "top",
  //       visibilityTime: 2000,
  //     });
  //   } else {
  //     Toast.show({
  //       type: "success",
  //       text1: "Login successful.",
  //       position: "top",
  //       visibilityTime: 2000,
  //     });
  //     router.replace("/(main)");
  //   }
  // };

  return (
    <SafeAreaView style={[styles.container, { marginBottom: keyboardHeight }]}>
      <View></View>
      <View style={styles.header}>
        <View style={styles.heading_container}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.description}>
            Please enter your details to login to your account.
          </Text>
        </View>

        <View style={styles.input_main_container}>
          <View style={styles.input_wrapper}>
            <MaterialIcons name="email" size={20} color="#017a62" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#fff"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.horizontal_line} />

          <View
            style={[styles.input_wrapper, { marginTop: verticalScale(20) }]}
          >
            <MaterialIcons name="lock" size={20} color="#017a62" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#fff"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.horizontal_line} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.forgot_pass}
            onPress={() => router.push("/(auth)/forgetPassword")}
          >
            <Text style={styles.link_description}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#017a62" />
        ) : (
          <ButtonComp
            title="Login"
            onPress={handleLogin}
            style={{ width: scale(250), backgroundColor: "#046350" }}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/signup")}
          style={{ marginTop: verticalScale(20) }}
        >
          <Text style={styles.description}>
            Don't have an account?{" "}
            <Text style={styles.link_description}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(40),
    paddingHorizontal: scale(30),
    backgroundColor: "#000",
  },
  header: {
    width: "100%",
    gap: verticalScale(40),
  },
  heading_container: {
    gap: verticalScale(10),
  },
  heading: {
    fontSize: moderateScale(24),
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: moderateScale(14),
    color: "#ffefef",
  },
  input_main_container: {
    width: "100%",
  },
  input_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingBottom: verticalScale(5),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#fff",
  },
  horizontal_line: {
    width: "100%",
    height: verticalScale(1),
    backgroundColor: "#017a62",
  },
  link_description: {
    color: "#017a62",
    fontWeight: "bold",
  },
  forgot_pass: {
    alignSelf: "flex-end",
    marginTop: verticalScale(10),
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
});

export default Login;
