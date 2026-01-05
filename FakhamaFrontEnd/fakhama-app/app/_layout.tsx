import { Stack } from 'expo-router';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { CartProvider } from './context/CartContext';

export default function Layout() {
  return (
    // On crée un conteneur global qui applique le correctif pour TOUT LE MONDE
    <View style={styles.container}>
      {/* On force la barre de statut (l'heure/batterie) à être visible mais sans écraser le contenu */}
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
      
      {/* Toutes tes pages (Stack) s'affichent à l'intérieur de ce View protégé */}
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // C'est ICI que la magie opère pour toute l'appli :
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  }
});