import { UseGroup } from "@/src/hooks/useGroup";
import { Image } from "expo-image";
import React from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function CreateGroup() {
  const {
    groupName,
    setGroupName,
    search,
    searchProfiles,
    toggleUser,
    selectedUsers,
    mergedUsers,
    createGroup,
  } = UseGroup();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#000" }}>
      <TextInput
        placeholder="Group Name"
        placeholderTextColor="#aaa"
        value={groupName}
        onChangeText={setGroupName}
        style={{
          backgroundColor: "#222",
          padding: 12,
          borderRadius: 10,
          color: "#fff",
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Search users..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={searchProfiles}
        style={{
          backgroundColor: "#222",
          padding: 12,
          borderRadius: 10,
          color: "#fff",
          marginBottom: 15,
        }}
      />

      <FlatList
        data={mergedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.includes(item.id);

          return (
            <TouchableOpacity
              onPress={() => toggleUser(item.id)}
              style={{
                padding: 12,
                backgroundColor: isSelected ? "rgb(91, 132, 91)" : "#333",
                marginBottom: 10,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: item.avatar,
                }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />

              <View style={{ paddingLeft: moderateScale(10) }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, color: "#ffffff" }}
                >
                  {item.name}
                </Text>
                <Text style={{ color: "#bebebe" }}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        onPress={createGroup}
        style={{
          backgroundColor: "#046350",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );
}
