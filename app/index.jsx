import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import DraftScreen from "./Screens/Draft/DraftScreen";
import EditorScreen from "./Screens/Editor/Editor";

const Stack = createStackNavigator();

function App() {
  return (
    // <NavigationContainer>
    <Stack.Navigator
      initialRouteName="DraftScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="DraftScreen" component={DraftScreen} />
      <Stack.Screen name="EditorScreen" component={EditorScreen} />
    </Stack.Navigator>
    // </NavigationContainer>
  );
}

export default App;
