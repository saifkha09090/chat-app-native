import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const userSearch = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setSearchEmail(text);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (text.length > 2) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `%${text}%`)
        .neq("email", user?.email);

      if (!error) setUsers(data);
    } else {
      setUsers([]);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          placeholder="Search by email..."
          style={styles.input}
          value={searchEmail}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.userCard}
            onPress={() =>
              router.push({
                pathname: "/(main)/chatScreen",
                params: { name: item.full_name, receiverId: item.id },
              })
            }
          >
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#292F3F", padding: scale(10) },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: { flex: 1, padding: moderateScale(12), fontSize: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { fontWeight: "bold", fontSize: 16 },
  email: { color: "#666" },
});

export default userSearch;
