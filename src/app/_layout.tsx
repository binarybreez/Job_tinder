import { Slot } from "expo-router";
import "../../global.css";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ClerkProvider } from "@clerk/clerk-expo";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Slot/>
    </ClerkProvider>
  );
}
