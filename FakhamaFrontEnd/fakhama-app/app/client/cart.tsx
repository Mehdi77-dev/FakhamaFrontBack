import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCart } from '../context/CartContext';
import api from '../../src/services/api';

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F9F9F9',
  placeholder: '#EDEDED'
};

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
  const [cinImage, setCinImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickCin = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Erreur', "Permission d'accès à la galerie requise !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 1,
    });

    if (!result.canceled) {
      setCinImage(result.assets[0].uri);
    }
  };

  const submitOrder = async () => {
    if (cartItems.length === 0) return Alert.alert('Panier vide');
    if (!cinImage) return Alert.alert('Oups', 'Veuillez scanner votre CIN avant de valider.');

    setLoading(true);
    try {
      const formData = new FormData();

      // CIN image
      const filename = cinImage.split('/').pop() as string;
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('cin', { uri: cinImage, name: filename, type } as any);

      // Items payload
      const simplifiedItems = cartItems.map((item: any) => ({
        product_id: item.productId ?? item.product?.id ?? null,
        start_date: item.startDate,
        end_date: item.endDate,
        size: item.size,
        price: item.totalPrice ?? item.pricePerDay ?? null,
      }));

      formData.append('items', JSON.stringify(simplifiedItems));

      await api.post('/reservations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Félicitations ! 🎉', "Votre commande a été envoyée. L'admin va la traiter.");
      clearCart();
      setCinImage(null);
      router.replace('/client/home' as any);
    } catch (error: any) {
      console.error('submitOrder error:', error.response?.data || error.message || error);
      Alert.alert('Erreur', "L'envoi a échoué. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={{flex: 1, marginLeft: 12}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.size ? `Taille: ${item.size}` : ''}</Text>
        <Text style={styles.meta}>{item.startDate} → {item.endDate}</Text>
        <Text style={styles.price}>{item.totalPrice} DH</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.trashButton}>
        <FontAwesome name="trash" size={20} color="#B00020" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>MON PANIER</Text>
        <View style={{width: 40}} />
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={{alignItems: 'center', marginTop: 40}}>
            <Text style={{color: '#999'}}>Votre panier est vide.</Text>
          </View>
        )}
        contentContainerStyle={{padding: 20}}
      />

      {/* CIN SECTION */}
      <View style={styles.cinSection}>
        <Text style={styles.cinTitle}>VALIDATION D'IDENTITÉ (Requise pour la commande)</Text>
        <TouchableOpacity style={[styles.cinButton, cinImage && {borderColor: Colors.black, backgroundColor: Colors.black}]} onPress={pickCin}>
          <Ionicons name="camera-outline" size={20} color={cinImage ? Colors.white : Colors.black} />
          <Text style={[styles.cinText, cinImage && {color: Colors.white}]}>📸 Scanner / Importer ma CIN</Text>
        </TouchableOpacity>
        {cinImage && (
          <Image source={{ uri: cinImage }} style={styles.cinPreview} />
        )}
      </View>

      {/* SUMMARY */}
      <View style={styles.summary}>
        <Text style={styles.totalLabel}>Total à payer</Text>
        <Text style={styles.totalValue}>{getCartTotal()} DH</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={submitOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>CONFIRMER LA DEMANDE</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconButton: { width: 36, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: Colors.gray, padding: 12, borderRadius: 10 },
  thumb: { width: 90, height: 70, borderRadius: 8, backgroundColor: Colors.placeholder },
  name: { fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 12, color: '#666' },
  price: { fontWeight: '700', marginTop: 6 },
  trashButton: { padding: 8 },

  cinSection: { paddingHorizontal: 20, paddingBottom: 20 },
  cinTitle: { fontWeight: '700', marginBottom: 10 },
  cinButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  cinText: { marginLeft: 10 },
  cinPreview: { width: 120, height: 80, marginTop: 10, borderRadius: 8 },

  summary: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  totalLabel: { fontWeight: '700' },
  totalValue: { fontWeight: '700' },

  footer: { padding: 20 },
  confirmButton: { backgroundColor: Colors.black, padding: 16, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700' }
});
