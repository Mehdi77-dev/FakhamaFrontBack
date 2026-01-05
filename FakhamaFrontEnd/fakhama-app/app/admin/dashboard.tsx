import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
  border: '#E0E0E0',
};

export default function AdminDashboard() {
  const router = useRouter();

  const [userName, setUserName] = useState('Admin');

  // --- STATE FOR DASHBOARD METRICS ---
  const [stats, setStats] = useState({
    revenue: '0 DH',
    activeRentals: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  // Dynamic Date
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- BACKEND CONNECTION ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data || response.data.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch Stats Error:', error.response?.data || error.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch profile to personalize admin UI
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        const data = response.data?.data || response.data;
        if (data && data.name) setUserName(data.name);
      } catch (err) {
        console.warn('Could not fetch profile for dashboard:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
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
      router.replace('/');
    } catch (error) {
      console.error('❌ Logout Error critique:', error);
      // En cas d'erreur critique, rediriger quand même
      router.replace('/');
    }
  };

  const renderMenuButton = (title: string, icon: any, route: string) => (
    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={Colors.black} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.black} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{"BIENVENUE, " + (userName || 'ADMIN').toUpperCase()}</Text>
          <Text style={styles.date}>{today.toUpperCase()}</Text>
        </View>

        {/* Stats Cards */}
        <Text style={styles.sectionTitle}>APERÇU RAPIDE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {/* Revenue Card */}
          <View style={[styles.statCard, styles.cardBlack]}>
            <Ionicons name="wallet-outline" size={24} color={Colors.white} />
            <Text style={[styles.statValue, { color: Colors.white }]}>{stats.revenue}</Text>
            <Text style={[styles.statLabel, { color: '#CCC' }]}>REVENUS (MOIS)</Text>
          </View>

          {/* Total Products Card */}
          <View style={styles.statCard}>
            <Ionicons name="shirt-outline" size={24} color={Colors.black} />
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>COSTUMES TOTAL</Text>
          </View>

          {/* Active Rentals Card */}
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={Colors.black} />
            <Text style={styles.statValue}>{stats.activeRentals}</Text>
            <Text style={styles.statLabel}>EN LOCATION</Text>
          </View>
        </ScrollView>

        {/* Menu Actions */}
        <Text style={styles.sectionTitle}>GESTION</Text>
        <View style={styles.menuContainer}>
          {renderMenuButton("AJOUTER UN COSTUME", "add-circle-outline", "/admin/add-product")}
          {renderMenuButton("GÉRER LES COSTUMES", "list-outline", "/admin/manage-products")}
          {renderMenuButton("RÉSERVATIONS", "calendar-outline", "/admin/reservations")}
          {renderMenuButton("MON PROFIL", "person-outline", "/admin/profile")}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>SE DÉCONNECTER</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 20, marginBottom: 40 },
  greeting: { fontSize: 28, color: Colors.black, fontWeight: 'bold', letterSpacing: 2 },
  date: { color: '#666', fontSize: 12, marginTop: 5, letterSpacing: 1, textTransform: 'uppercase' },
  sectionTitle: { color: Colors.black, fontSize: 14, fontWeight: '600', marginBottom: 15, letterSpacing: 1, marginTop: 10 },
  statsScroll: { marginBottom: 30 },
  statCard: { backgroundColor: Colors.lightGray, width: 140, height: 140, borderRadius: 0, padding: 15, marginRight: 15, justifyContent: 'space-between', borderWidth: 1, borderColor: '#EEE' },
  cardBlack: { backgroundColor: Colors.black, borderColor: Colors.black },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.black },
  statLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', letterSpacing: 1 },
  menuContainer: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.black, marginBottom: 30 },
  menuButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  iconContainer: { marginRight: 15 },
  menuText: { color: Colors.black, flex: 1, fontSize: 14, fontWeight: '500', letterSpacing: 1 },
  logoutButton: { alignItems: 'center', padding: 15, borderWidth: 1, borderColor: Colors.black, marginTop: 10 },
  logoutText: { color: Colors.black, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});