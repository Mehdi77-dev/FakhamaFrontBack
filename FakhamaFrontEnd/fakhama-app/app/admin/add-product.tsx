import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, Alert, Image, Switch
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/services/api';

const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  border: '#E0E0E0',
};

export default function AddProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isEdit, setIsEdit] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // FORM STATE
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState('MARIAGE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available options
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  // Official categories - must match backend ENUM exactly
  const categories = ['TOUT', 'MARIAGE', 'BUSINESS', 'SOIRÉE', 'ACCESSOIRES'];

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Erreur", "Permission d'accès à la galerie requise !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], 
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Prefill when edit mode — run only once on mount to avoid infinite update loop
  useEffect(() => {
    if (!params) return;
    if (params?.editMode && params?.productData) {
      try {
        const raw = params.productData;
        const product = typeof raw === 'string' ? JSON.parse(raw) : raw;

        setIsEdit(true);
        setProductId(String(product.id || product._id || ''));
        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(String(product.price || ''));
        setCategory(product.category || 'MARIAGE');

        // Gestion spéciale pour les tailles (Array ou String)
        if (Array.isArray(product.sizes)) {
          setSelectedSizes(product.sizes);
        } else if (typeof product.sizes === 'string') {
          try {
            setSelectedSizes(JSON.parse(product.sizes));
          } catch (e) {
            setSelectedSizes([]);
          }
        }

        // Pour l'image, on garde l'URL existante si on ne la change pas
        setImage(product.image || null);
        // Initialize featured flag when editing
        setIsFeatured(!!product.is_featured);
      } catch (e) {
        console.error('Erreur parsing product', e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (!name || !price || selectedSizes.length === 0 || !description || !image) {
      Alert.alert('Incomplet', 'Veuillez remplir tous les champs et ajouter une photo.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('price', String(price));
      formData.append('description', description);
      formData.append('category', category);
        // featured flag
        formData.append('is_featured', isFeatured ? '1' : '0');
      
      // Append sizes as indexed array (Laravel style)
      selectedSizes.forEach((size, index) => {
        formData.append(`sizes[${index}]`, size);
      });

      // Attach image for Laravel (field name 'image') only if it's a local file URI
      if (image && !image.startsWith('http')) {
        formData.append('image', {
          uri: image,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }

      let response;
      if (isEdit && productId) {
        // For Laravel, send POST with _method=PUT to allow file upload
        formData.append('_method', 'PUT');
        response = await api.post(`/products/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      console.log('Succès:', response.data);
      Alert.alert('Succès', isEdit ? 'Produit mis à jour avec succès !' : 'Produit ajouté avec succès !', [
        { text: 'OK', onPress: () => router.push('/admin/manage-products') }
      ]);

      if (!isEdit) {
        // Reset form only on create
        setName('');
        setPrice('');
        setDescription('');
        setSelectedSizes([]);
        setImage(null);
        setCategory('MARIAGE');
        setIsFeatured(false);
      }

    } catch (error: any) {
      console.error('Erreur API:', error.response ? error.response.data : error.message || error);
      Alert.alert('Erreur', error.response?.data?.message || "Erreur lors de l'ajout du produit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'MODIFIER LE COSTUME' : 'NOUVEAU COSTUME'}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Image Input */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={styles.imageText}>AJOUTER UNE PHOTO</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Text Inputs */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>NOM DU COSTUME</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Smoking Velvet Noir" 
            placeholderTextColor="#CCC"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>PRIX PAR JOUR (DH)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 450" 
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CATÉGORIE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catButton, category === cat && styles.catButtonActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Size Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>TAILLES DISPONIBLES</Text>
          <View style={styles.sizeContainer}>
            {sizes.map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.sizeButton, selectedSizes.includes(s) && styles.sizeButtonActive]}
                onPress={() => toggleSize(s)}
              >
                <Text style={[styles.sizeText, selectedSizes.includes(s) && styles.sizeTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Détails du tissu, coupe, occasion..." 
            placeholderTextColor="#CCC"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: '#F5F5F5',
          padding: 15,
          borderRadius: 12,
          marginVertical: 20,
          borderWidth: 1,
          borderColor: '#E0E0E0'
        }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
              Mettre en avant ? 🌟
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Afficher dans "Coups de Cœur"
            </Text>
          </View>
            
          <Switch
            trackColor={{ false: "#cfcfcf", true: "#000" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) => setIsFeatured(val)}
            value={isFeatured}
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>{submitting ? (isEdit ? 'MISE À JOUR...' : 'ENVOI EN COURS...') : (isEdit ? 'METTRE À JOUR' : 'ENREGISTRER LE PRODUIT')}</Text>
        </TouchableOpacity>

      </ScrollView>
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
  content: { padding: 20, paddingBottom: 50 },
  imagePicker: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.gray,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { marginTop: 10, color: '#999', fontSize: 12, letterSpacing: 1, fontWeight: 'bold' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  formGroup: { marginBottom: 25 },
  formGroupRow: { marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1, color: Colors.black },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.black,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  catButton: {
    paddingVertical: 8, paddingHorizontal: 15, marginRight: 10,
    borderWidth: 1, borderColor: Colors.black, borderRadius: 4,
  },
  catButtonActive: { backgroundColor: Colors.black },
  catText: { fontSize: 11, fontWeight: '600', color: Colors.black },
  catTextActive: { color: Colors.white },
  sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeButton: {
    width: 40, height: 40,
    borderWidth: 1, borderColor: '#CCC',
    alignItems: 'center', justifyContent: 'center',
  },
  sizeButtonActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  sizeText: { fontSize: 12, fontWeight: 'bold', color: Colors.black },
  sizeTextActive: { color: Colors.white },
  submitButton: {
    backgroundColor: Colors.black,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: Colors.white, fontWeight: 'bold', letterSpacing: 2 },
});