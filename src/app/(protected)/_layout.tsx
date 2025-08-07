import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const ProtectedLayout = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }
  return <Stack screenOptions={{headerShown:false}}/>;
};

export default ProtectedLayout;
