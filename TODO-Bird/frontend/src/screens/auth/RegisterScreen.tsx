import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((s) => s.login);

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      const res = await authApi.register(email, password);
      await loginStore(res.data.token);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>REGISTER</Text>
      <Text style={styles.subtitle}>Initialize your system</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#4B5563"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#4B5563"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B10',
    padding: 24,
    justifyContent: 'center',
  },
  brand: {
    color: '#F3F4F6',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    color: '#F3F4F6',
    padding: 14,
    borderRadius: 6,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  linkText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
});