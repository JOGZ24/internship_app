import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { useAuth } from '@/src/providers/AuthProvider';
import { Link } from 'expo-router';
import { useTasks } from '../../../providers/TasksContext';

interface Task {
  id: number;
  name: string;
  instruction_text: string;
  user_id: Int16Array | null;
  stage_id: number;
}

export default function TabOneScreen() {
  const { tasks, setTasks, fetchAndStoreTasks } = useTasks();
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const { token, username } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTeamId(token);
    }
  }, [token]);

  useEffect(() => {
    if (teamId && token && tasks.length === 0) {
      fetchAndStoreTasks(token, teamId).then(() => setLoading(false));
    }
  }, [teamId, token, tasks, fetchAndStoreTasks]);

  useEffect(() => {
    setIsEmpty(tasks.length === 0);
  }, [tasks]);

  const fetchTeamId = async (token: string) => {
    try {
      const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/teams/?search=${username}`, {
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

  const handleTakeTask = async (taskId: number) => {
    if (!token) return;

    setSelectedTaskId(taskId);

    try {
      const userResponse = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/users/?search=${username}`, {
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

      const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/take_task/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: taskId,
          userId: userId,
        }),
      });

      if (response.ok) {
        console.log('Tâche prise:', taskId);
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        setSelectedTaskId(null); // Reset the selected task ID after successful action
      } else {
        console.error('Erreur lors de la prise de la tâche:', response.status);
        setSelectedTaskId(null); // Reset in case of error
      }
    } catch (error) {
      console.error('Erreur lors de la prise de la tâche:', error);
      setSelectedTaskId(null); // Reset in case of error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (token && teamId) {
      try {
        await fetchAndStoreTasks(token, teamId);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données: ', error);
      }
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <Link href={`/menu/${item.id}`} asChild>
      <Pressable style={styles.itemContainer}>
        <Text style={styles.name}>{item.name || 'Nom non disponible'}</Text>
        <Text style={styles.instructions}>
          {item.instruction_text ? (item.instruction_text === "False" ? "No instructions available" : item.instruction_text) : 'Instructions non disponibles'}
        </Text>
        <Text>Stage: {item.stage_id}</Text>
        <Pressable
          style={[
            styles.takeTaskButton,
            selectedTaskId === item.id && styles.takeTaskButtonSelected,
          ]}
          onPress={() => handleTakeTask(item.id)}
        >
          <Text style={styles.takeTaskButtonText}>Take the work order</Text>
        </Pressable>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#5C59F4" />
      ) : isEmpty ? (
        <Text style={{ color: 'black' }}>Aucune tâche disponible.</Text>
      ) : (
        <FlatList
          data={tasks}
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
    backgroundColor: '#f9f9f9',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  takeTaskButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  takeTaskButtonSelected: {
    backgroundColor: '#0056b3',
  },
  takeTaskButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});
