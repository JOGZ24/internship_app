import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Button, RefreshControl } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useAuth } from '@/src/providers/AuthProvider';

interface Task {
  id: number;
  name: string;
  instruction_text: string;
  user_id: Int16Array;
}

export default function TabOneScreen() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      const filteredData = jsonData.filter(task => task.user_id === null);
      setData(filteredData);
      setLoading(false);
      setIsEmpty(filteredData.length === 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des données: ', error);
      setLoading(false);
    }
  };

  const handleTakeTask = async (taskId: number) => {
    try {
      // Requête pour obtenir l'ID de l'utilisateur
      const userResponse = await fetch(`https://f565-2001-818-dbbb-a100-759c-3981-2506-ec6f.ngrok-free.app/api/users/?search=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'ID de l\'utilisateur');
      }

      const userData = await userResponse.json();
      if (userData.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const userId = userData[0].id;

      // Requête pour prendre la tâche
      const response = await fetch(`https://f565-2001-818-dbbb-a100-759c-3981-2506-ec6f.ngrok-free.app/api/take_task/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          taskId: taskId,
        }),
      });

      if (response.ok) {
        console.log('Tâche prise:', taskId);
        // Mettre à jour les données pour filtrer la tâche prise
        setData(prevData => prevData.filter(task => task.id !== taskId));
      } else {
        console.error('Erreur lors de la prise de la tâche:', response.status);
        // Gérez l'erreur de la manière appropriée
      }
    } catch (error) {
      console.error('Erreur lors de la prise de la tâche:', error);
      // Gérez l'erreur de la manière appropriée
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données: ', error);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.name}>{item.id}</Text>
      <Text style={styles.name}>{item.name || 'Nom non disponible'}</Text>
      <Text style={styles.instructions}>
        {item.instruction_text ? (item.instruction_text === "False" ? "Aucune instruction disponible" : item.instruction_text) : 'Instructions non disponibles'}
      </Text>
      <Button title="Prendre la tâche" onPress={() => handleTakeTask(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#5C59F4" />
      ) : isEmpty ? (
        <Text style={{ color: 'black' }}>Aucune tâche disponible.</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
