import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Colors = { white: '#FFFFFF', black: '#000000', darkGray: '#333333' };

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: '', prenom: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!form.nom || !form.prenom || !form.email || !form.password || !form.phone) {
      Alert.alert('Incomplet', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Tentative d\'inscription avec:', { email: form.email });
      const response = await api.post('/auth/register', {
        name: form.prenom,
        surname: form.nom,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      console.log('✅ Inscription réussie - Réponse:', response.data);
      
      // NE PAS stocker le token ici (Backend ne le renvoie pas à l'inscription)
      // Afficher l'alerte de confirmation avec redirection vers login
      Alert.alert(
        'Félicitations',
        'Votre compte a été créé avec succès ! Connectez-vous.',
        [
          { 
            text: 'Se connecter', 
            onPress: () => {
              console.log('🔄 Redirection vers la page de login');
              router.replace('/');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.response?.data || error.message);
      Alert.alert(
        'Erreur d\'inscription',
        error.response?.data?.message || 'Impossible de créer le compte'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logoText}>INSCRIPTION</Text>
        <View style={styles.divider} />

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="NOM" 
            placeholderTextColor="#999"
            onChangeText={(t) => setForm({...form, nom: t})} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="PRÉNOM" 
            placeholderTextColor="#999"
            onChangeText={(t) => setForm({...form, prenom: t})} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="TÉLÉPHONE" 
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            onChangeText={(t) => setForm({...form, phone: t})} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="EMAIL (@gmail.com)" 
            placeholderTextColor="#999"
            autoCapitalize="none"
            onChangeText={(t) => setForm({...form, email: t})} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="MOT DE PASSE" 
            placeholderTextColor="#999"
            secureTextEntry 
            onChangeText={(t) => setForm({...form, password: t})} 
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'INSCRIPTION...' : 'S\'INSCRIRE'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={styles.linkText}>DÉJÀ UN COMPTE ? SE CONNECTER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 40, paddingVertical: 60, alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: 'bold', letterSpacing: 4, color: Colors.black },
  divider: { width: 40, height: 2, backgroundColor: Colors.black, marginVertical: 15 },
  form: { width: '100%', marginTop: 20 },
  input: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingVertical: 12, fontSize: 14, marginBottom: 15, letterSpacing: 1 },
  button: { backgroundColor: Colors.black, paddingVertical: 18, alignItems: 'center', marginTop: 30 },
  buttonText: { color: Colors.white, fontWeight: '600', letterSpacing: 2 },
  linkText: { fontSize: 10, textAlign: 'center', textDecorationLine: 'underline', letterSpacing: 1 }
});