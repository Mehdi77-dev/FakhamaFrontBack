import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F9F9F9',
  darkGray: '#333333',
  placeholder: '#E0E0E0',
  gold: '#B48B3E',
  red: '#FF4444', 
};

export default function ClientHomeScreen() {
  const router = useRouter();
  const videoRef = useRef(null);

  // --- DATA STATE (Cleaned for Backend) ---
  // Currently empty. Friend will populate this array.
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  // --- BACKEND CONNECTION ---
    useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        // Fetch featured products from backend
        const response = await api.get('/products/featured');
        setFeaturedProducts(response.data.data || response.data || []);
      } catch (error: any) {
        console.error('Fetch Featured Error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
    }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/client/profile' as any)} style={styles.iconButton}>
            <Ionicons name="person-outline" size={28} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <Text style={styles.logoText}> ⚜ فَخَامَة ⚜ </Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/client/cart' as any)}
        >
          <Ionicons name="bag-outline" size={24} color={Colors.black} />
          <View style={styles.cartBadge} />
        </TouchableOpacity>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} 
      >
        
        {/* HERO SECTION (Design - Kept Static) */}
        <View style={styles.heroContainer}>
          
          {/* Video (Top) */}
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.heroVideo}
              source={require('../../assets/videos/Work.mp4')} 
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={true}
              isMuted={true}
            />
            <View style={styles.videoOverlay} />
          </View>

          {/* Image + Text (Bottom) */}
          <ImageBackground
            source={require('../../assets/images/wlcm.jpg')} 
            style={styles.imageSection}
            imageStyle={styles.bgImage}
          >
            <View style={styles.textOverlay}>
              <Text style={styles.collectionTag}>COLLECTION 2025</Text>
              <Text style={styles.mainTitle}>L'ÉLÉGANCE MASCULINE</Text>

              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPress={() => router.push('/client/catalog' as any)}
              >
                <Text style={styles.primaryButtonText}>DÉCOUVRIR LA COLLECTION</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/client/about' as any)}
              >
                <Text style={styles.secondaryButtonText}>À PROPOS DE NOUS</Text>
                <View style={styles.underline} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* SECTION "TOP PRODUCTS" (Dynamic Data) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NOS COUPS DE CŒUR</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* Filters removed: showing only featured products */}

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {loading ? (
             <ActivityIndicator size="small" color={Colors.black} />
          ) : (
             featuredProducts.length > 0 ? (
                 featuredProducts.map((item) => (
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
                 <View style={{width: '100%', alignItems: 'center', marginTop: 20}}>
                     <Text style={{color: '#999', fontSize: 12}}>Bientôt disponible...</Text>
                 </View>
             )
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FAKHAMA © 2025</Text>
        </View>

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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: Colors.black,
  },
  cartButton: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  heroContainer: {
    width: '100%',
    marginBottom: 40,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  imageSection: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    resizeMode: 'cover',
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  collectionTag: {
    color: Colors.white,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  mainTitle: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 25,
  },
  primaryButton: {
    backgroundColor: Colors.white, 
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 0,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: Colors.black, 
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
  },
  secondaryButton: {
    paddingVertical: 5,
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  underline: {
    height: 1,
    backgroundColor: Colors.white,
    width: '100%',
    marginTop: 3,
    opacity: 0.8,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: Colors.black,
    marginBottom: 8,
  },
  sectionDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.black,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  productCard: {
    width: COLUMN_WIDTH,
    marginBottom: 30,
  },
  imageContainer: {
    height: 250,
    backgroundColor: Colors.placeholder,
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
    letterSpacing: 1,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    width: '80%',
    alignSelf: 'center',
  },
  footerText: {
    color: '#CCC',
    fontSize: 10,
    letterSpacing: 2,
  }
});