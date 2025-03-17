import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Version du thème - incrémentez cette valeur à chaque changement majeur de couleurs
const THEME_VERSION = '1.1.0';
const THEME_VERSION_KEY = 'theme_version';

// Définition des couleurs du thème - Nouvelle palette basée sur vert et marron
const lightTheme = {
  // Couleurs principales
  primary: '#4A7C59', // Vert forêt - équilibre et rigueur
  secondary: '#8C5E58', // Marron chaud - chaleur et stabilité
  
  // Couleurs de fond
  background: '#F6F4F1', // Crème légèrement grisé - plus sombre que blanc pur
  card: '#ECE9E4', // Beige clair - texture et chaleur
  
  // Couleurs de texte et bordures
  text: '#2D2A26', // Marron très foncé - professionnel et naturel
  border: '#D8D2CB', // Beige moyen - doux et chaleureux
  
  // Couleurs de notification et d'état
  notification: '#DB504A', // Rouge terre cuite - chaleureux mais attire l'attention
  success: '#5F9EA0', // Bleu-vert - calme et positif
  warning: '#C1803C', // Ocre/ambre - alerte naturelle
  info: '#6A8D73', // Vert sauge - informatif et apaisant
  danger: '#DB504A', // Rouge terre cuite - identique à notification
  
  // Couleurs supplémentaires pour les catégories d'événements
  category1: '#5F9EA0', // Bleu-vert
  category2: '#4A7C59', // Vert forêt
  category3: '#8C5E58', // Marron chaud
  category4: '#6A8D73', // Vert sauge
  category5: '#C1803C', // Ocre/ambre
  category6: '#997950', // Marron moyen
  category7: '#7B9E89', // Vert de gris
};

const darkTheme = {
  // Couleurs principales
  primary: '#6A8D73', // Vert sauge plus clair pour contraste sur fond sombre
  secondary: '#A67F78', // Marron rosé plus clair pour visibilité
  
  // Couleurs de fond
  background: '#292520', // Brun foncé riche - chaleureux et reposant
  card: '#3A3631', // Marron grisé - texture et profondeur
  
  // Couleurs de texte et bordures
  text: '#ECE9E4', // Beige clair - doux pour les yeux
  border: '#59534D', // Marron moyen-foncé - subtil mais visible
  
  // Couleurs de notification et d'état
  notification: '#E67E73', // Rouge terre cuite plus clair
  success: '#78B0B2', // Bleu-vert plus clair
  warning: '#D9A76A', // Ocre/ambre plus clair
  info: '#86A991', // Vert sauge plus clair
  danger: '#E67E73', // Rouge terre cuite plus clair
  
  // Couleurs de catégories
  category1: '#78B0B2', // Bleu-vert plus clair
  category2: '#6A8D73', // Vert sauge
  category3: '#A67F78', // Marron rosé
  category4: '#86A991', // Vert sauge plus clair
  category5: '#D9A76A', // Ocre/ambre plus clair
  category6: '#B3986E', // Marron moyen plus clair
  category7: '#97B8A5', // Vert de gris plus clair
};

type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({children}: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [themeVersion, setThemeVersion] = useState<string | null>(null);

  // Vérifier si la version du thème a changé
  useEffect(() => {
    const checkThemeVersion = async () => {
      try {
        const storedVersion = await AsyncStorage.getItem(THEME_VERSION_KEY);
        setThemeVersion(storedVersion);
        
        // Si la version stockée est différente de la version actuelle, forcer la mise à jour
        if (storedVersion !== THEME_VERSION) {
          console.log('Mise à jour du thème détectée - Actualisation des couleurs');
          await AsyncStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
          // Forcer un rafraîchissement du composant
          setIsDark(prev => prev);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la version du thème:', error);
      }
    };
    
    checkThemeVersion();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  // Fonction pour forcer le rafraîchissement du thème
  const refreshTheme = () => {
    console.log('Rafraîchissement forcé du thème');
    setIsDark(prev => !prev); // Toggle temporaire
    setTimeout(() => setIsDark(prev => !prev), 50); // Retour à l'état d'origine après 50ms
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{theme, isDark, toggleTheme, refreshTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
