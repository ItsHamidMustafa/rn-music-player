import { Stack } from "expo-router";
import { AudioProvider } from "../context/AudioContext";

export default function RootLayout() {
  return (
    <AudioProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </AudioProvider>
  )
}