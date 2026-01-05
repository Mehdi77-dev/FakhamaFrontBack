import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, 
  StatusBar, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  bgGray: '#F8F9FA',
  gold: '#D4AF37',
  green: '#4CAF50',
  orange: '#FF9800',
  border: '#EEEEEE',
};

export default function ClientProfileScreen() {
  const router = useRouter();

  // --- STATE FOR USER DATA (Clean for Backend) ---
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeRental, setActiveRental] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- BACKEND CONNECTION ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        const user = response.data.data || response.data;
        
        setUserProfile({
            name: user.name || "Client",
            email: user.email || "client@email.com",
            initials: user.name?.substring(0, 2).toUpperCase() || "CL",
            avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || 'Client') + "&background=000000&color=FFFFFF&size=256&bold=true" 
        });
        
        // Récupérer les réservations actives et l'historique
        const rentalsResponse = await api.get('/reservations/my');
        const rentals = rentalsResponse.data.data || rentalsResponse.data || [];
        
        // Séparer active et history
        const active = rentals.find((r: any) => r.status === 'active');
        const hist = rentals.filter((r: any) => r.status !== 'active');
        
        setActiveRental(active || null);
        setHistory(hist);
        
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch user data error:', error.response?.data || error.message);
        // Fallback mock
        setUserProfile({
            name: "Client",
            email: "client@email.com",
            initials: "CL",
            avatar: "https://ui-avatars.com/api/?name=Client&background=000000&color=FFFFFF&size=256&bold=true" 
        });
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // --- ACTIONS ---
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Oui", 
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
    ]);
  };

  const handleProlonger = () => {
    Alert.alert("Prolongation", "Veuillez contacter l'admin pour prolonger : 06 00 00 00 00");
  };

  if (loading) {
      return (
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={Colors.black} />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MON COMPTE</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* --- PROFIL (IMAGE SUPPORT ADDED) --- */}
        <View style={styles.profileHeader}>
          {userProfile?.avatar ? (
             <Image source={{ uri: userProfile.avatar }} style={styles.avatarImage} />
          ) : (
             <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{userProfile?.initials || "C"}</Text>
             </View>
          )}
          
          <Text style={styles.userName}>{userProfile?.name || "Client"}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || "email@domain.com"}</Text>
        </View>

        {/* --- LOCATION ACTIVE --- */}
        <Text style={styles.sectionTitle}>EN CE MOMENT</Text>
        {activeRental ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.badgeText, { color: Colors.orange }]}>
                  À RENDRE {activeRental.returnDate.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.activeContent}>
              <Image source={{ uri: activeRental.image }} style={styles.activeImage} />
              <View style={styles.activeDetails}>
                <Text style={styles.productName}>{activeRental.name}</Text>
                <Text style={styles.price}>{activeRental.price}</Text>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleProlonger}>
                  <Text style={styles.actionButtonText}>PROLONGER</Text>
                  <Ionicons name="time-outline" size={14} color={Colors.white} style={{marginLeft: 5}}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucune location en cours</Text>
          </View>
        )}

        {/* --- HISTORIQUE --- */}
        <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        <View style={styles.historyContainer}>
          {history.length > 0 ? (
              history.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyName}>{item.name}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyPrice}>{item.price}</Text>
                  </View>
                  {index < history.length - 1 && <View style={styles.divider} />}
                </View>
              ))
          ) : (
             <View style={{padding: 20, alignItems: 'center'}}>
                 <Text style={{color: '#999', fontSize: 12}}>Aucun historique.</Text>
             </View>
          )}
        </View>

        {/* --- SUPPORT --- */}
        <Text style={styles.sectionTitle}>AIDE & SUPPORT</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/client/about' as any)}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.black} />
            </View>
            <Text style={styles.menuTitle}>À propos / Aide</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => Alert.alert("Conditions\n\n","Pour valider votre commande, vous acceptez les conditions suivantes : \n\n⏱️ Soyez à l'heure : Tout retard sera facturé\n \n🪪 Identité : Une pièce d'identité originale est obligatoire pour le retrait.\n\n✨ Soin : Ne lavez pas le costume. En cas de dégât, les frais sont à votre charge.\n\n📅 Annulation : Prévenir au moins 48h à l'avance.")}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="document-text-outline" size={22} color={Colors.black} />
            </View>
            <Text style={styles.menuTitle}>Conditions Générales</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>FAKHAMA • Version Client</Text>
        <View style={{ height: 30 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bgGray,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.bgGray,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  iconButton: { padding: 5 },
  content: { paddingHorizontal: 20 },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  // CHANGED: Improved avatar style to be cleaner
  avatarImage: {
    width: 80, height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2, 
    borderColor: Colors.white,
    backgroundColor: Colors.black // Black background just in case
  },
  avatarCircle: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: Colors.black,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5,
  },
  avatarText: { color: Colors.white, fontWeight: 'bold', fontSize: 28 },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.black, marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#666' },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#999', 
    marginTop: 25, marginBottom: 10, marginLeft: 5, letterSpacing: 1,
  },
  activeCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8,
    borderWidth: 1, borderColor: '#FFF',
  },
  activeHeader: { marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  activeContent: { flexDirection: 'row' },
  activeImage: {
    width: 70, height: 90, borderRadius: 8, resizeMode: 'cover',
    backgroundColor: '#EEE', marginRight: 15,
  },
  activeDetails: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  productName: { fontSize: 14, fontWeight: 'bold', color: Colors.black, marginBottom: 2 },
  price: { fontSize: 13, color: '#666' },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.black,
    paddingVertical: 8, borderRadius: 6, marginTop: 5,
    alignSelf: 'flex-start', paddingHorizontal: 15,
  },
  actionButtonText: { color: Colors.white, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  emptyBox: {
    padding: 20, backgroundColor: Colors.white, borderRadius: 15,
    alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD',
  },
  emptyText: { color: '#999', fontStyle: 'italic', fontSize: 12 },
  historyContainer: {
    backgroundColor: Colors.white, borderRadius: 15, padding: 5,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5,
  },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 15,
  },
  historyIcon: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  historyName: { fontSize: 13, fontWeight: 'bold', color: Colors.black },
  historyDate: { fontSize: 11, color: '#888', marginTop: 2 },
  historyPrice: { fontSize: 13, fontWeight: 'bold', color: Colors.black },
  menuContainer: {
    backgroundColor: Colors.white, borderRadius: 15, overflow: 'hidden',
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 15,
  },
  menuIconBox: {
    width: 30, alignItems: 'center', marginRight: 10,
  },
  menuTitle: { fontSize: 13, fontWeight: '600', color: Colors.black },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 50 },
  versionText: {
    textAlign: 'center', color: '#CCC', fontSize: 10, marginTop: 30,
  }
});