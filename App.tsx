import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ActivityIndicator, View } from 'react-native';
import { SavedProvider } from './context/SavedContext';

import HomeScreen       from './screens/HomeScreen';
import SearchScreen     from './screens/SearchScreen';
import SymptomScreen    from './screens/SymptomScreen';
import RemediesScreen   from './screens/RemediesScreen';
import DetailScreen     from './screens/DetailScreen';
import IngredientsScreen from './screens/IngredientsScreen';
import SavedScreen      from './screens/SavedScreen';
import ProfileScreen    from './screens/ProfileScreen';

export type RootStackParamList = {
  Home:        undefined;
  Search:      undefined;
  Symptom:     undefined;
  Remedies:    { category: string };
  Detail:      { id: string };
  Ingredients: undefined;
  Saved:       undefined;
  Profile:     undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#13665A" />
      </View>
    );
  }

  return (
    <SavedProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Home"        component={HomeScreen}        />
          <Stack.Screen name="Search"      component={SearchScreen}      />
          <Stack.Screen name="Symptom"     component={SymptomScreen}     />
          <Stack.Screen name="Remedies"    component={RemediesScreen}    />
          <Stack.Screen name="Detail"      component={DetailScreen}      />
          <Stack.Screen name="Ingredients" component={IngredientsScreen} />
          <Stack.Screen name="Saved"       component={SavedScreen}       />
          <Stack.Screen name="Profile"     component={ProfileScreen}     />
        </Stack.Navigator>
      </NavigationContainer>
    </SavedProvider>
  );
}
