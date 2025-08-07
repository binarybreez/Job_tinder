import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const create = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>create</Text>
      </View>
    </SafeAreaView>
  );
};

export default create;

const styles = StyleSheet.create({});
