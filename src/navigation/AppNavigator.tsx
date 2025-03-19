import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des écrans
import CalendarScreen from '../screens/CalendarScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

// Import du hook de thème
import {useTheme} from '../context/ThemeContext';

// Types pour la navigation
export type RootStackParamList = {
  Main: undefined;
  EventDetail: {eventId: number};
  CreateEvent: {date?: string; categoryId?: number};
  NotificationSettings: undefined;
};

export type MainTabParamList = {
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Navigateur principal avec les onglets
const MainTabNavigator = () => {
  const {theme} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
      })}>
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendrier',
          tabBarLabel: 'Calendrier',
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Statistiques',
          tabBarLabel: 'Stats',
          tabBarIcon: ({color, size}) => (
            <Icon name="chart-bar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          tabBarLabel: 'Paramètres',
          tabBarIcon: ({color, size}) => (
            <Icon name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navigateur root avec la pile de navigation
const AppNavigator = () => {
  const {theme} = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
      }}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{title: 'Détails de l\'événement'}}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{title: 'Nouvel événement'}}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{title: 'Notifications'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
