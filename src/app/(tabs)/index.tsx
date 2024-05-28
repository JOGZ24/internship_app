import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, ListRenderItem } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useAuth } from '@/src/providers/AuthProvider';

interface Task {
  id: number;
  name: string;
  instruction_text: string;
}

export default function TabOneScreen() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<number | null>(null);

  const { token, username } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTeamId();
    }
  }, [token]);

  useEffect(() => {
    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  const fetchTeamId = async () => {
    try {
      const response = await fetch(`https://f565-2001-818-dbbb-a100-759c-3981-2506-ec6f.ngrok-free.app/api/teams/?search=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      const jsonData = await response.json();
      if (jsonData.length > 0) {
        // Si une équipe est trouvée, obtenir son ID
        setTeamId(jsonData[0].id);
      } else {
        console.log('Aucune équipe trouvée pour cet utilisateur.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID de l\'équipe: ', error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`https://f565-2001-818-dbbb-a100-759c-3981-2506-ec6f.ngrok-free.app/api/tasks/?search=${teamId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      const jsonData: Task[] = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données: ', error);
      setLoading(false);
    }
  };

  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.name}>{item.name || 'Nom non disponible'}</Text>
      <Text style={styles.instructions}>
        {item.instruction_text ? (item.instruction_text === "False" ? "Aucune instruction disponible" : item.instruction_text) : 'Instructions non disponibles'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#5C59F4" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  instructions: {
    fontSize: 16,
    color: '#666666',
  },
});
