import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(protected)/seeker/SeekerProfile");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <SafeAreaView className="flex items-center justify-center h-full">
      <View className="border-2 border-black rounded-xl p-4 w-[95%] h-fit">
        <Text className="font-extrabold text-4xl mb-8">Sign in</Text>
        <TextInput
          className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />
        <TextInput
          className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity
          onPress={onSignInPress}
          className="flex items-center justify-center"
        >
          <Text className="font-bold text-[18px] border-2 border-gray-500 rounded-2xl w-[50%] text-center py-1">
            Continue
          </Text>
        </TouchableOpacity>
        <View className="flex-row gap-3 items-center justify-center mt-2">
          <Text className="text-lg text-gray-700">
            Don&apos;t have an account?
          </Text>
          <Link href="/sign-up">
            <Text>Sign up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
