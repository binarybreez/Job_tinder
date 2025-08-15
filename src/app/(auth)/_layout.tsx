// app/(auth)/_layout.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack,Redirect } from "expo-router";

export default function AuthRoutesLayout() {
  const {isSignedIn} = useAuth()
  const {user} = useUser()
  if(isSignedIn){
    if(user?.unsafeMetadata?.role ==='employer'){
      return <Redirect href={"/(protected)/employer"} />
    }else{
      return <Redirect href={"/(protected)/seeker"} />
    }
  }
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}
