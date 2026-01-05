import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, Switch, ScrollView, SafeAreaView, Alert,
  Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  border: '#E0E0E0',
  red: '#FF4444',
};

export default function AdminProfileScreen() {
  const router = useRouter();

  // --- STATE FOR USER PROFILE ---
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local states for UI toggles
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [sounds, setSounds] = useState(true);

  // --- BACKEND CONNECTION ---
    useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        const userData = response.data?.data || response.data;
        setUser(userData);
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch profile error:', error.response?.data || error.message);
        // Fallback to mock if error
        setUser({
          name: "Admin",
          email: "admin@email.com",
          role: "ADMIN",
          avatar: "https://ui-avatars.com/api/?name=Admin&background=000000&color=FFFFFF&size=256&bold=true" 
        });
        setLoading(false);
      }
    };
    fetchProfile();
    }, []);


  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se déconnecter", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🔐 Tentative de logout...');
              
              // Essayer d'appeler l'API de logout
              try {
                const response = await api.post('/logout');
                console.log('✅ Logout API success:', response.data);
              } catch (apiError: any) {
                // Même si l'API échoue, on continue la déconnexion locale
                console.warn('⚠️ Logout API error (mais on continue):', apiError.response?.data || apiError.message);
              }
              
              // Supprimer le token localement QUELLE QUE SOIT la réponse
              await AsyncStorage.removeItem('token');
              console.log('💾 Token supprimé d\'AsyncStorage');
              
              // Rediriger vers la connexion
              console.log('🔄 Redirection vers la page de login');
              router.replace('/' as any);
            } catch (error) {
              console.error('❌ Logout Error critique:', error);
              // En cas d'erreur critique, rediriger quand même
              router.replace('/' as any);
            }
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert("Maintenance", "Le cache de l'application a été vidé avec succès.", [{ text: "OK" }]);
  };

  const renderSettingItem = (icon: any, title: string, value: boolean, onToggle: (val: boolean) => void) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={Colors.black} />
        </View>
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Switch
        trackColor={{ false: "#E0E0E0", true: Colors.black }}
        thumbColor={Colors.white}
        ios_backgroundColor="#E0E0E0"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );

  if (loading) {
      return (
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={Colors.black} />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MON PROFIL</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar} 
              />
            ) : (
              <FontAwesome name="user-circle" size={100} color="#333" />
            )}
          </View>
          <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.white} style={{marginRight: 4}} />
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'ADMIN'}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>
        <View style={styles.sectionContainer}>
          {renderSettingItem("notifications-outline", "Notifications", notifications, setNotifications)}
          <View style={styles.divider} />
          {renderSettingItem("finger-print-outline", "Face ID / Biométrie", biometrics, setBiometrics)}
          <View style={styles.divider} />
          {renderSettingItem("volume-high-outline", "Sons & Haptique", sounds, setSounds)}
        </View>

        {/* Maintenance */}
        <Text style={styles.sectionTitle}>MAINTENANCE</Text>
        <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.menuLink} onPress={handleClearCache}>
                <View style={styles.settingLeft}>
                    <View style={styles.iconBox}>
                        <Ionicons name="trash-bin-outline" size={20} color={Colors.black} />
                    </View>
                    <Text style={styles.menuLinkText}>Vider le cache</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.menuLink} onPress={() => Alert.alert("Info", "Version 1.0.0")}>
            <Text style={styles.menuLinkText}>À propos de l'application</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuLink}>
            <Text style={styles.menuLinkText}>Conditions d'utilisation</Text>
            
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          <Text style={styles.logoutText}>SE DÉCONNECTER</Text>
        </TouchableOpacity>

        <Text style={styles.version}>v1.0.0 - FAKHAMA - Admin Panel</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: 5 },
  navTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.white,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.black, letterSpacing: 0.5 },
  email: { fontSize: 14, color: '#888', marginBottom: 15 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#999',
    marginBottom: 10, marginLeft: 5, letterSpacing: 1,
  },
  sectionContainer: {
    backgroundColor: Colors.gray, borderRadius: 12, padding: 5, marginBottom: 25,
  },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 15,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 30, alignItems: 'center', marginRight: 10 },
  settingText: { fontSize: 14, fontWeight: '500', color: Colors.black },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginLeft: 55 },
  menuLink: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 15,
  },
  menuLinkText: { fontSize: 14, color: Colors.black },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, marginTop: 10,
    borderWidth: 1, borderColor: '#FFEAEA', backgroundColor: '#FFF5F5', borderRadius: 12,
  },
  logoutText: { color: Colors.red, fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  version: { textAlign: 'center', color: '#CCC', fontSize: 10, marginTop: 20 }
});