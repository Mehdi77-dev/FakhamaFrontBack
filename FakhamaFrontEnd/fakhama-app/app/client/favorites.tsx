import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F9F9F9',
  darkGray: '#333333',
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH FAVORITES FROM API ---
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.get('/favorites');
        setFavorites(response.data.data || response.data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch Favorites Error:', error.response?.data || error.message);
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const renderFavoriteItem = ({ item }: { item: any }) => {
    // If the API returns a pivot object with a product field, use it.
    const productData = item?.product ? item.product : item;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/client/product',
            params: { data: JSON.stringify(productData) },
          } as any)
        }
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: productData.image }} style={styles.productImage} />
          {productData.tag && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{productData.tag}</Text>
            </View>
          )}

          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <FontAwesome name="heart" size={20} color="red" />
          </View>
        </View>
        <Text style={styles.productName} numberOfLines={1}>
          {productData.name}
        </Text>
        <Text style={styles.productPrice}>{productData.price} DH / jour</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        }}
      >
        {/* Left: Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            flex: 1,
            textAlign: 'center',
            color: Colors.black,
          }}
        >
          MES FAVORIS
        </Text>

        {/* Right: Placeholder for symmetry */}
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.black} />
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={styles.emptyText}>
            Aucun coup de cœur pour le moment
          </Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => router.push('/client/catalog' as any)}
          >
            <Text style={styles.discoverButtonText}>
              DÉCOUVRIR LA COLLECTION
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gridContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  productCard: {
    width: COLUMN_WIDTH,
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#EEE',
    marginBottom: 10,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  discoverButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 2,
  },
  discoverButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
