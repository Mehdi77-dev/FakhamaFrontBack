import React from 'react';
import { 
  StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity, 
  Dimensions, StatusBar, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Palette de couleurs "Dark Gold"
const Colors = {
  black: '#1A1A1A',
  white: '#FFFFFF',
  darkGold: '#B48B3E', 
  grayText: '#666666',
  cardBg: '#FFFFFF',
  creamBg: '#F9F8F4',
};

export default function AboutUsScreen() {
  const router = useRouter();

  const reviews = [
    {
      id: '1',
      name: 'Karim M.',
      city: 'Casablanca',
      initials: 'KM',
      // TEXTE MODIFIÉ : Focus costume homme
      text: "Une expérience exceptionnelle ! J'ai loué un smoking pour un gala et la coupe était parfaite. Fakhama offre une qualité irréprochable.",
      stars: 5
    },
    {
      id: '2',
      name: 'Sara A.',
      city: 'Rabat',
      initials: 'SA',
      // TEXTE MODIFIÉ : Femme qui loue pour un homme (Mari)
      text: "J'ai loué un costume 3 pièces pour mon mari. Le service est excellent et il était très élégant pour notre soirée.",
      stars: 5
    },
    {
      id: '3',
      name: 'Youssef B.',
      city: 'Marrakech',
      initials: 'YB',
      // TEXTE MODIFIÉ : Nom Fakhama + Focus costume
      text: "Service impeccable. Fakhama a transformé ma façon de m'habiller pour les grands événements. Des pièces de haute qualité.",
      stars: 5
    },
  ];

  const renderStars = (count: number) => {
    let stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name={i < count ? "star" : "star-outline"} 
          size={16} 
          color={Colors.darkGold} 
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row', marginBottom: 15 }}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* BOUTON RETOUR FIXE */}
      <TouchableOpacity onPress={() => router.back()} style={styles.fixedBackButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* HERO SECTION */}
        <ImageBackground
          // J'ai gardé ton image (logo.png) comme demandé
          source={require('../../assets/images/logo.png')} 
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>À PROPOS</Text>
            <View style={styles.divider} />
            <Text style={styles.heroDescription}>
              {/* TEXTE MODIFIÉ : Fakhama + Masculine uniquement */}
              Fakhama redéfinit l'élégance masculine au Maroc. 
              Nous croyons que le luxe d'un grand costume doit être accessible, simple et durable.
            </Text>
          </View>
        </ImageBackground>

        {/* REVIEWS SECTION */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Ce que disent nos <Text style={{ color: Colors.darkGold, fontStyle: 'italic' }}>Clients</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              L'excellence reconnue par ceux qui nous font confiance.
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{review.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{review.name}</Text>
                    <Text style={styles.userCity}>{review.city}</Text>
                  </View>
                </View>

                {renderStars(review.stars)}
                
                <Ionicons name="chatbubble-ellipses-outline" size={28} color={Colors.darkGold} style={styles.quoteIcon} />
                
                <Text style={styles.reviewText}>"{review.text}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.creamBg,
  },
  fixedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 15 : 50,
    left: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 30,
    zIndex: 100,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: height * 0.6,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    padding: 30,
    paddingBottom: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: Colors.darkGold,
    marginBottom: 20,
  },
  heroDescription: {
    color: '#EEE',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  reviewsSection: {
    paddingVertical: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.creamBg,
    marginTop: -30,
  },
  sectionHeader: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    letterSpacing: 1,
  },
  reviewsScroll: {
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    width: width * 0.75,
    marginRight: 25,
    padding: 30,
    borderRadius: 25,
    shadowColor: Colors.darkGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(180, 139, 62, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.darkGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: Colors.darkGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  userCity: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },
  quoteIcon: {
    marginBottom: 15,
    opacity: 0.8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});