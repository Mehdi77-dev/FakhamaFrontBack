import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../src/services/api';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');
const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  darkGray: '#333333',
};

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params?.id;
  
  // --- STATE FOR DATA (Clean for Backend) ---
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  // --- USER SELECTIONS ---
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // --- DATE LOGIC ---
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [hasSelectedDates, setHasSelectedDates] = useState(false);

  // CIN moved to Cart page

  // --- BACKEND CONNECTION ---
  useEffect(() => {
    const loadProduct = async () => {
      // If navigation passed product data (from favorites), use it
      if (params?.data) {
        try {
          const parsed = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
          setProduct(parsed);
          setIsFavorite(!!parsed.is_favorite);
        } catch (e) {
          console.error('Erreur lecture données produit:', e);
          Alert.alert('Erreur', 'Impossible de charger le produit.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Otherwise fetch by id from API
      if (id) {
        try {
          const response = await api.get(`/products/${id}`);
          const data = response.data.data || response.data;
          setProduct(data);
          setIsFavorite(!!data.is_favorite);
        } catch (error: any) {
          console.error('Fetch Product Error:', error.response?.data || error.message);
          Alert.alert('Erreur', 'Impossible de charger le produit');
        } finally {
          setLoading(false);
        }
      } else {
        // No id and no params -> stop loading
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, params?.data]);

  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    setHasSelectedDates(true);
    if (Platform.OS === 'android') setShowStartPicker(false);
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
    if (Platform.OS === 'android') setShowEndPicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const toggleFavorite = async () => {
    const previousState = isFavorite;
    setIsFavorite(!isFavorite); // Optimistic update
    try {
      await api.post('/favorites/toggle', { product_id: product.id });
    } catch (error: any) {
      setIsFavorite(previousState); // Rollback on error
      console.error('Favorite toggle error:', error.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de modifier les favoris");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      return Alert.alert('Oups', 'Veuillez sélectionner une taille.');
    }
    if (!hasSelectedDates) {
      return Alert.alert('Oups', 'Veuillez sélectionner les dates.');
    }
    if (endDate <= startDate) {
      return Alert.alert('Erreur', "La date de fin doit être après la date de début.");
    }

    // compute days (at least 1)
    const msPerDay = 24 * 60 * 60 * 1000;
    const start = new Date(formatDate(startDate));
    const end = new Date(formatDate(endDate));
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay));
    const pricePerDay = Number(product.price) || 0;
    const totalPrice = pricePerDay * days;

    const cartItem = {
      productId: product.id,
      name: product.name,
      image: product.image,
      size: selectedSize,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      pricePerDay,
      days,
      totalPrice
    };

    addToCart(cartItem as any);
    Alert.alert('Ajouté', 'Article dans le panier');
  };

  // --- LOADING VIEW ---
  if (loading || !product) {
    return (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <ActivityIndicator size="large" color={Colors.black} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <FontAwesome 
                name={isFavorite ? "heart" : "heart-o"} 
                size={24} 
                color={isFavorite ? "#E74C3C" : Colors.black} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>
          <Text style={styles.perDay}>par jour</Text>

          <Text style={styles.description}>{product.description}</Text>

          {/* DATE PICKER (Essential) */}
          <Text style={styles.sectionTitle}>DATES DE RÉSERVATION</Text>
          
          <TouchableOpacity style={styles.dateSelector} onPress={() => setShowStartPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={Colors.black} />
            <Text style={styles.dateText}>
                {hasSelectedDates ? startDate.toLocaleDateString() : "Date de début"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
              minimumDate={new Date()}
            />
          )}

          <TouchableOpacity style={[styles.dateSelector, {marginTop: 10}]} onPress={() => setShowEndPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={Colors.black} />
            <Text style={styles.dateText}>
                {hasSelectedDates ? endDate.toLocaleDateString() : "Date de fin"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
              minimumDate={startDate}
            />
          )}

          {/* Size Selector */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>TAILLE (EU)</Text>
          <View style={styles.sizeRow}>
            {product.sizes && product.sizes.map((size: string) => (
              <TouchableOpacity 
                key={size} 
                style={[styles.sizeButton, selectedSize === size && styles.sizeButtonActive]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="card-outline" size={20} color={Colors.black} />
            <Text style={styles.infoText}>Carte d'identité (CIN) requise pour louer</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.black} />
            <Text style={styles.infoText}>Nettoyage professionnel inclus</Text>
          </View>

          {/* CIN verification moved to Cart page */}

        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.rentButton]} 
          onPress={handleAddToCart} 
          activeOpacity={0.9}
        >
          <Text style={styles.rentButtonText}>{'AJOUTER AU PANIER 🛒'}</Text>
          <Ionicons name="bag-outline" size={20} color={Colors.white} style={{marginLeft: 10}}/>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingBottom: 100 },
  imageContainer: { width: '100%', height: height * 0.6, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  detailsContainer: { padding: 25, backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 20, fontWeight: 'bold', color: Colors.black, letterSpacing: 1, maxWidth: '70%' },
  price: { fontSize: 20, fontWeight: 'bold', color: Colors.black },
  perDay: { fontSize: 12, color: '#999', textAlign: 'right', marginBottom: 20 },
  description: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1, color: Colors.black },
  
  // Date Picker Style
  dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 10 },
  dateText: { fontSize: 14, color: Colors.black, flex: 1, marginLeft: 10 },

  sizeRow: { flexDirection: 'row', marginBottom: 30 },
  sizeButton: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sizeButtonActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  sizeText: { fontSize: 12, fontWeight: 'bold', color: Colors.black },
  sizeTextActive: { color: Colors.white },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 15, backgroundColor: Colors.gray, borderRadius: 10 },
  infoText: { marginLeft: 10, fontSize: 12, color: '#333', fontWeight: '500' },
  
  // CIN Verification Styles
  cinButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2, 
    borderColor: Colors.black, 
    borderStyle: 'dashed',
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15
  },
  cinButtonActive: { backgroundColor: Colors.black, borderColor: Colors.black, borderStyle: 'solid' },
  cinButtonText: { fontSize: 14, fontWeight: '600', color: Colors.black, marginLeft: 10 },
  cinButtonTextActive: { color: Colors.white },
  cinPreviewContainer: { alignItems: 'center', marginBottom: 20 },
  cinPreview: { width: 120, height: 80, borderRadius: 8, marginBottom: 10 },
  cinLoadedText: { fontSize: 12, fontWeight: 'bold', color: '#4CAF50' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 10 },
  rentButton: { backgroundColor: Colors.black, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 50 },
  rentButtonText: { color: Colors.white, fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }
});