import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { ShelvesScreen } from './src/screens/ShelvesScreen';
import { CrystalBallScreen } from './src/screens/CrystalBallScreen';
import { AnomaliesScreen } from './src/screens/AnomaliesScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { SettingsModal } from './src/components/SettingsModal';

const Tab = createBottomTabNavigator();

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink.deep} />
      <NavigationContainer key={reloadKey}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: colors.brass.light,
            tabBarInactiveTintColor: colors.cream.muted,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarLabel: 'Cauldron',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="flask-round-bottom" size={size} color={color} />
              ),
            }}
          >
            {({ navigation }) => (
              <HomeScreen
                onOpenSettings={() => setSettingsOpen(true)}
                onNavigateTab={(tab) => navigation.navigate(tab)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Shelves"
            component={ShelvesScreen}
            options={{
              tabBarLabel: 'Shelves',
              tabBarIcon: ({ color, size }) => (
                <Feather name="package" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="CrystalBall"
            component={CrystalBallScreen}
            options={{
              tabBarLabel: 'Crystal Ball',
              tabBarIcon: ({ color, size }) => (
                <Feather name="eye" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Anomalies"
            component={AnomaliesScreen}
            options={{
              tabBarLabel: 'Strange',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="alert-decagram" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Events"
            component={EventsScreen}
            options={{
              tabBarLabel: 'Curse',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="moon-waning-gibbous" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUrlChanged={() => setReloadKey((k) => k + 1)}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.ink.deep,
    borderTopColor: colors.brass.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
