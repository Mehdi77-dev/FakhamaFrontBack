import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, Modal, Dimensions, Linking 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  green: '#4CAF50', // Status: Returned
  red: '#FF4444',   // Status: Late
  orange: '#FF9800',// Status: Active
  border: '#E0E0E0',
};

export default function ReservationsScreen() {
  const router = useRouter();

  // --- STATE FOR RENTALS ---
  // Started as empty array [] waiting for Backend data
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCin, setSelectedCin] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- BACKEND CONNECTION ---
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations');
      const data = response.data.data || response.data || [];
      setRentals(data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching reservations:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de charger les réservations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // --- MARK AS RETURNED ---
  const handleReturn = (id: string) => {
    Alert.alert(
      "Confirmer le retour",
      "Le costume a-t-il bien été récupéré en bon état ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, valider", 
          onPress: async () => {
            try {
              await api.put(`/reservations/${id}/return`);
              console.log("Reservation marked as returned:", id);
              Alert.alert('Succès', 'Retour validé avec succès');
              // Rafraîchir la liste
              await fetchReservations();
            } catch (error: any) {
              console.error('Return error:', error.response?.data || error.message);
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de valider le retour');
            }
          }
        }
      ]
    );
  };

  const renderStatusBadge = (status: string) => {
    let color = Colors.gray;
    let text = 'INCONNU';

    switch (status) {
      case 'active':
        color = Colors.orange;
        text = 'EN LOCATION';
        break;
      case 'late':
        color = Colors.red;
        text = 'EN RETARD';
        break;
      case 'returned':
        color = Colors.green;
        text = 'TERMINÉ';
        break;
      case 'pending': // Added pending just in case
        color = Colors.gray;
        text = 'EN ATTENTE';
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
    );
  };

  const renderRentalItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.user?.name || item.clientName || 'Client'}</Text>
        {renderStatusBadge(item.status)}
      </View>
      
      {/* Product Image */}
      {item.product?.image && (
        <Image source={{ uri: item.product.image }} style={styles.productImage} />
      )}
      
      <Text style={styles.productName}>{item.product?.name || item.productName || 'Produit'}</Text>
      <Text style={styles.dateText}>Début : {item.start_date || item.startDate}</Text>
      <Text style={styles.dateText}>Fin prévue : {item.end_date || item.returnDate}</Text>
      
      {/* Action Buttons */}
      <View style={{ marginTop: 15 }}>
        {/* LIGNE 1 : Informations (Contacter + CIN) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          
          {/* Bouton CONTACTER (Gauche) */}
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5', 
              paddingVertical: 10, 
              borderRadius: 8,
              marginRight: 5,
              borderWidth: 1,
              borderColor: '#e0e0e0'
            }}
            onPress={() => Linking.openURL(`tel:${item.user?.phone || ''}`)}
          >
            <Ionicons name="call-outline" size={18} color="black" />
            <Text style={{ marginLeft: 5, fontWeight: '600', fontSize: 13 }}>Contacter</Text>
          </TouchableOpacity>

          {/* Bouton VOIR CIN (Droite) */}
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#e3f2fd',
              paddingVertical: 10, 
              borderRadius: 8,
              marginLeft: 5,
              borderWidth: 1,
              borderColor: '#bbdefb'
            }}
            onPress={() => {
              if (item.cin_url) {
                setSelectedCin(item.cin_url);
                setModalVisible(true);
              } else {
                Alert.alert("Info", "Pas de CIN");
              }
            }}
          >
            <Ionicons name="id-card-outline" size={18} color="#0d47a1" />
            <Text style={{ marginLeft: 5, fontWeight: '600', fontSize: 13, color: '#0d47a1' }}>Voir CIN</Text>
          </TouchableOpacity>
        </View>

        {/* LIGNE 2 : Action Principale (Marquer Rendu) */}
        {item.status !== 'returned' && (
          <TouchableOpacity 
            style={{ 
              backgroundColor: 'black', 
              paddingVertical: 12, 
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
            onPress={() => handleReturn(item.id)}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={{ marginLeft: 8, color: 'white', fontWeight: 'bold', fontSize: 14 }}>
              MARQUER COMME RENDU
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RÉSERVATIONS</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.centerLoading}>
           <ActivityIndicator size="large" color={Colors.black} />
        </View>
      ) : (
        /* List */
        <FlatList
            data={rentals}
            keyExtractor={(item) => item.id}
            renderItem={renderRentalItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune réservation active.</Text>
            }
        />
      )}

      {/* CIN Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedCin && (
              <Image source={{ uri: selectedCin }} style={styles.cinImage} />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => { setModalVisible(false); setSelectedCin(null); }}>
              <Text style={styles.closeButtonText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  backButton: { padding: 5 },
  listContent: { padding: 20 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 10,
    backgroundColor: '#EEE',
  },
  
  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  cinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.black,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 0, 
  },
  returnButtonText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    backgroundColor: Colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cinImage: {
    width: '100%',
    height: screenHeight * 0.6,
    resizeMode: 'contain',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: Colors.black,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  }
});