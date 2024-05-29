// TabLayout.tsx

import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, Tabs, router, useNavigation } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout({ navigation }: { navigation: any }) {
  const colorScheme = useColorScheme();
  const navigations = useNavigation();

  const handleLogout = () => {
    // Implémentez ici la logique de déconnexion, par exemple, effacer les informations d'identification, puis rediriger vers l'écran d'authentification
    router.push("(auth)")
  };

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => (
          <Pressable onPress={handleLogout}>
            <Text style={{ color: 'black', marginRight: 10 }}>Logout</Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Work Orders', // Changer le nom ici
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="myTasks"
        options={{
          title: 'My Work Orders', // Changer le nom ici
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
