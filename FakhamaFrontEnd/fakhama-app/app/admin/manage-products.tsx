import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  border: '#E0E0E0',
  danger: '#FF4444',
};

export default function ManageProductsScreen() {
  const router = useRouter();

  // Official categories list (kept here for future filtering uses)
  const categories = ['TOUT', 'MARIAGE', 'BUSINESS', 'SOIRÉE', 'ACCESSOIRES'];

  // --- STATE FOR PRODUCTS LIST ---
  // Started as empty array [] waiting for Backend data
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- BACKEND CONNECTION ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?category=TOUT');
      setProducts(response.data.data || response.data || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de charger les produits');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer le costume ?",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/products/${id}`);
              console.log("Product deleted successfully:", id);
              Alert.alert('Succès', 'Produit supprimé avec succès');
              // Rafraîchir la liste
              await fetchProducts();
            } catch (error: any) {
              console.error('Delete error:', error.response?.data || error.message);
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer le produit');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} DH / jour</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/admin/add-product', params: { editMode: 'true', productData: JSON.stringify(item) } } as any)}
        >
          <Ionicons name="create-outline" size={22} color={Colors.black} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>GÉRER LES COSTUMES</Text>
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
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun costume disponible (Database Empty).</Text>
          }
        />
      )}
      
      {/* FAB (Add Button) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/admin/add-product' as any)}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>

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
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 0, 
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 80,
    resizeMode: 'cover',
    backgroundColor: Colors.gray,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: Colors.black,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});