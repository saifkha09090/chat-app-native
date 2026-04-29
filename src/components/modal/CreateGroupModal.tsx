import { supabase } from "@/src/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const CreateGroupModal = ({ visible, onClose, onPick }: any) => {
  const [groupName, setGroupName] = useState("");
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
  });

  const handleCreateGroup = async () => {
    console.log(groupName);
    const { error } = await supabase.from("conversations").insert({
      name: groupName,
      is_group: true,
      created_by: user?.id,
    });
    if (error) {
      console.log("create ", error);
    } else {
      console.log("group created");
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={{ color: "#fff" }}>Create New Group</Text>
            <View style={styles.card}>
              <TextInput
                placeholder="Enter Group Name"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.btn_container}
                activeOpacity={0.8}
                onPress={handleCreateGroup}
              >
                <Text style={styles.btn_text}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(29, 29, 29, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 20,
  },
  card: {
    width: "100%",
    padding: scale(15),
    borderRadius: 12,
  },

  input: {
    backgroundColor: "#1a1c1e",
    padding: moderateScale(12),
    fontSize: 16,
    color: "#fff",
    borderRadius: 8,
    marginBottom: verticalScale(12),
  },

  btn_container: {
    backgroundColor: "#046350",
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: "center",
  },

  btn_text: {
    fontSize: moderateScale(14),
    color: "white",
    fontWeight: "600",
  },
});

export default CreateGroupModal;
