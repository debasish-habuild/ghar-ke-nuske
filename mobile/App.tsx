import React, { useEffect } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { ActivityIndicator, View } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { SavedProvider } from "./context/SavedContext";
import { CatalogProvider } from "./context/CatalogContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ProfileProvider } from "./context/ProfileContext";
import { initMessaging } from "./services/notifications";

// Background / quit-state FCM handler. Must be registered at module scope (not
// inside a component) so it is in place before the app mounts.
messaging().setBackgroundMessageHandler(async (message) => {
  console.log("[fcm] background message", message.messageId);
});

import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import RemediesScreen from "./screens/RemediesScreen";
import DetailScreen from "./screens/DetailScreen";
import IngredientsScreen from "./screens/IngredientsScreen";
import SavedScreen from "./screens/SavedScreen";
import ProfileScreen from "./screens/ProfileScreen";

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Remedies: { category: string; categoryId?: string; ingredientId?: string };
  Detail: { id: string };
  Ingredients: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Deep links. The web /share page redirects to `gharkenuskhe://remedy/<id>`
// when the app is installed; that opens straight to the remedy's detail.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["gharkenuskhe://"],
  config: {
    screens: {
      Home: "",
      Detail: "remedy/:id",
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Connect to Firebase Cloud Messaging once on startup: request permission,
  // fetch the FCM token, and listen for foreground messages.
  useEffect(() => {
    let cleanup = () => {};
    initMessaging().then((unsub) => {
      cleanup = unsub;
    });
    return () => cleanup();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#13665A" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ProfileProvider>
        <CatalogProvider>
          <SavedProvider>
            <NavigationContainer linking={linking}>
              <ThemedStatusBar />
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                {/* Concern → Remedies and (card) → Detail use an "expanding card"
                    open: a native crossfade here + an in-screen scale-up (see
                    ExpandIn) instead of the dated slide-from-side. */}
                <Stack.Screen
                  name="Remedies"
                  component={RemediesScreen}
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="Detail"
                  component={DetailScreen}
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="Ingredients"
                  component={IngredientsScreen}
                  options={{ animation: "fade" }}
                />
                <Stack.Screen name="Saved" component={SavedScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </SavedProvider>
        </CatalogProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

// Status-bar icons follow the theme: dark glyphs on the light background,
// light glyphs on the dark background.
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}
