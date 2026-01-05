import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, 
  SafeAreaView, Dimensions, StatusBar, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F9F9F9',
  darkGray: '#333333',
};

export default function CatalogScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('TOUT');

  // --- STATE FOR PRODUCTS (Clean for Backend) ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Categories (Can also be fetched from DB later)
  const categories = ['TOUT', 'MARIAGE', 'BUSINESS', 'SOIRÉE', 'ACCESSOIRES'];

  // --- BACKEND CONNECTION ---
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        // Always send category to backend (backend supports /products?category=...)
        const response = await api.get(`/products?category=${selectedCategory}`);
        
        setProducts(response.data.data || response.data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch Catalog Error:', error.response?.data || error.message);
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [selectedCategory]); // Re-fetch when category changes

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      {/* --- DÉBUT DU NOUVEAU HEADER --- */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff'
      }}>
        {/* 1. GAUCHE : Bouton Retour existant */}
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>

        {/* 2. CENTRE : Titre centré */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          flex: 1,
          textAlign: 'center',
          color: Colors.black
        }}>
          LA COLLECTION
        </Text>

        {/* 3. DROITE : Icône Cœur (Favoris) */}
        <TouchableOpacity onPress={() => router.push('/client/favorites')} style={{ padding: 5 }}>
          <FontAwesome name="heart-o" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>
      {/* --- FIN DU NOUVEAU HEADER --- */}

      {/* Filter Categories */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catButton, selectedCategory === cat && styles.catButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView contentContainerStyle={styles.gridContent}>
        {loading ? (
             <View style={{marginTop: 50}}>
                <ActivityIndicator size="large" color={Colors.black} />
             </View>
        ) : (
            <View style={styles.productGrid}>
            {products.length > 0 ? (
                products.map((item) => (
                    <TouchableOpacity
                    key={item.id}
                    style={styles.productCard}
                    activeOpacity={0.9}
                    onPress={() => router.push({
                      pathname: '/client/product',
                      params: { id: item.id }
                    } as any)}
                    >
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                        {item.tag && (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                        )}
                    </View>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price} DH / jour</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={{width: '100%', alignItems: 'center', marginTop: 50}}>
                    <Text style={{color: '#999'}}>Aucun produit trouvé.</Text>
                </View>
            )}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  iconButton: { padding: 5 },
  filterContainer: { paddingVertical: 15 },
  catButton: {
    paddingVertical: 8, paddingHorizontal: 20, marginRight: 10,
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20,
  },
  catButtonActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  catText: { fontSize: 11, fontWeight: '600', color: Colors.darkGray },
  catTextActive: { color: Colors.white },
  gridContent: { paddingBottom: 40 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  productCard: { width: COLUMN_WIDTH, marginBottom: 30 },
  imageContainer: { height: 250, backgroundColor: '#EEE', marginBottom: 10, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  tagBadge: { position: 'absolute', top: 10, left: 0, backgroundColor: Colors.black, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  productName: { fontSize: 12, fontWeight: 'bold', color: Colors.black, marginBottom: 4 },
  productPrice: { fontSize: 12, color: '#666' },
});