import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");

  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [emailcode, setEmailCode] = React.useState("");
  // const [phonecode, setPhoneCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    console.log(emailAddress, password, username);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const emailVerify = await signUp.attemptEmailAddressVerification({
        code: emailcode,
      });
      console.log(`email verify : ${emailVerify}`);

      // If verification was completed, set the session to active
      // and redirect the user
      const isEmailVerified = emailVerify?.status === "complete";
      if (isEmailVerified) {
        await setActive({ session: emailVerify.createdSessionId });
        router.replace("/(protected)/Role");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(emailVerify, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="h-full flex items-center justify-center ">
        <View className="w-[95%] border-2 border-gray-500 rounded-3xl p-4 flex gap-4">
          <View>
            <Text className="font-bold text-[18px] text-center text-3xl">
              Verify your email
            </Text>
            <TextInput
              className="px-2 py-1 border-2 rounded-3xl text-lg tracking-widest"
              value={emailcode}
              placeholder="Enter your verification code"
              onChangeText={(code) => setEmailCode(code)}
            />
          </View>
          <TouchableOpacity
            onPress={onVerifyPress}
            className="w-[50%] border-2 rounded-3xl flex items-center justify-center"
          >
            <Text className="text-base font-semibold">Verify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex items-center justify-center h-full">
      <View className="border-2 border-black rounded-xl p-4 w-[95%] h-fit">
        <Text className="font-extrabold text-4xl mb-8">Sign up</Text>
        <TextInput
          className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
          className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TextInput
          className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          value={username}
          placeholder="Enter Username"
          onChangeText={(username) => setUsername(username)}
        />
        <TouchableOpacity
          onPress={onSignUpPress}
          className="flex items-center justify-center"
        >
          <Text className="font-bold text-[18px] border-2 border-gray-500 rounded-2xl w-[50%] text-center py-1">
            Continue
          </Text>
        </TouchableOpacity>
        <View className="flex-row gap-3 items-center justify-center mt-2">
          <Text className="text-lg text-gray-700">
            Already have an account?
          </Text>
          <Link href="/sign-in">
            <Text>Sign in</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
