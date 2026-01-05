import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  Image,
  KeyboardAvoidingView, // <--- NEW IMPORT
  Platform,             // <--- NEW IMPORT
  ScrollView,           // <--- NEW IMPORT
  Keyboard,             // <--- Optional: for dismissing keyboard
  TouchableWithoutFeedback // <--- Optional: for dismissing keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Colors = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F5F5F5',
  darkGray: '#333333',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Tentative de login avec:', { email });
      const response = await api.post('/auth/login', { email, password });
      
      console.log('✅ Réponse Backend complète:', response);
      console.log('📦 response.data:', response.data);
      
      // Extraction robuste du token (peut être token ou access_token)
      const token = response.data?.token || response.data?.access_token || response.data?.data?.token;
      const userData = response.data?.user || response.data?.data?.user;
      
      console.log('🔑 Token extrait:', token);
      console.log('👤 User Data:', userData);
      
      if (token) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', token);
        console.log('💾 Token stocké dans AsyncStorage');
        
        // Redirect based on user role
        const userRole = userData?.role || 'client';
        console.log('👮 Role utilisateur détecté:', userRole);
        
        console.log('Login Success - Réponse complète:', response.data);

        if (userRole === 'admin') {
          console.log('🔄 Redirection vers /admin/dashboard');
          router.replace('/admin/dashboard');
        } else {
          console.log('🔄 Redirection vers /client/home');
          router.replace('/client/home');
        }
      } else {
        console.error('❌ Pas de token trouvé dans la réponse');
        Alert.alert('Erreur', 'Pas de token reçu du serveur');
      }
    } catch (error: any) {
      console.error('❌ Login Error - Erreur complète:', error);
      console.error('Erreur Response Data:', error.response?.data);
      console.error('Erreur Message:', error.message);
      console.error('Erreur Status:', error.response?.status);
      console.error('Erreur Code:', error.code);
      
      let errorMessage = 'Vérifiez vos identifiants';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est actif sur 172.20.10.2:8000';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur réseau. Vérifiez l\'adresse IP et la connexion: 172.20.10.2:8000';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout réseau. Le serveur ne répond pas.';
      } else if (!error.response) {
        errorMessage = `Erreur réseau: ${error.message}`;
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Wrap everything in KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjusts the height gap
      >
        {/* 2. Wrap in ScrollView to allow scrolling when keyboard is open */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            
            <View style={styles.header}>
              <Image 
                source={require('../assets/images/loginFakhama.png')} 
                style={styles.logoImage}
              />
              <View style={styles.divider} />
              <Text style={styles.subtitle}>L'ÉLÉGANCE À VOTRE PORTÉE</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="EMAIL (@admin ou @gmail.com)"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <TextInput
                style={styles.input}
                placeholder="MOT DE PASSE"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{loading ? 'CONNEXION...' : 'SE CONNECTER'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerContainer}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.registerText}>CRÉER UN COMPTE</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // CHANGED: Renamed content to scrollContent and changed properties
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20, // Add padding at bottom so keyboard doesn't touch the last element
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20, // Added top margin for safety
  },
  logoImage: {
    width: 240,
    height: 190, 
    resizeMode: 'contain', 
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.black,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: Colors.darkGray,
    letterSpacing: 3,
  },
  form: {
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 15,
    fontSize: 14,
    marginBottom: 20,
    color: Colors.black,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: Colors.black,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 2,
    fontSize: 14,
  },
  registerContainer: {
    marginTop: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 11,
    color: Colors.black,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  }
});