// app/(auth)/_layout.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Stack,Redirect } from "expo-router";

export default function AuthRoutesLayout() {
  const {isSignedIn} = useAuth()
  if(isSignedIn){
    return <Redirect href={"/(protected)/seeker"} />
  }
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}
