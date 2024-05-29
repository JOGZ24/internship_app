import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { router, useNavigation } from 'expo-router'; // Importez useNavigation
import { useAuth } from '../../providers/AuthProvider'; // Ajustez le chemin selon l'emplacement de votre AuthContext

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setToken, setUser } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await fetch('https://f565-2001-818-dbbb-a100-759c-3981-2506-ec6f.ngrok-free.app/api-token-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(username);
      console.log(username);


      setUsername('');
      setPassword('');

      router.push("(tabs)");
    } catch (error) {
      console.error('Login failed:', error);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="black"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="black"
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 180,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#5C59F4',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginForm;
function setUser(username: string) {
  throw new Error('Function not implemented.');
}

