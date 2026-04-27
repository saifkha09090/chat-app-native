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

const UserSearch = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setSearchEmail(text);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (text.length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `%${text}%`)
        .neq("email", user?.email);

      if (!error) setUsers(data || []);
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
          placeholderTextColor="#aaa"
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
                uri: item.avatar_url,
              }}
              style={styles.avatar}
            />

            <View style={{ paddingLeft: moderateScale(10) }}>
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
  container: { flex: 1, backgroundColor: "#111B21", padding: scale(10) },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212632",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: 16,
    color: "#ffffff",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3b4252",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  name: { fontWeight: "bold", fontSize: 16, color: "#ffffff" },
  email: { color: "#bebebe" },
});

export default UserSearch;
