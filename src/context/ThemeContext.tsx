import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Version du thème - incrémentez cette valeur à chaque changement majeur de couleurs
const THEME_VERSION = '1.0.0';
const THEME_VERSION_KEY = 'theme_version';

// Définition des couleurs du thème - Nouvelle palette vibrante et rigoureuse
const lightTheme = {
  // Couleur principale - Bleu plus vif avec une touche de violet pour énergie et confiance
  primary: '#4361EE', // Bleu électrique - dynamique et énergique
  secondary: '#3A0CA3', // Violet profond - apporte une touche de créativité
  
  // Couleurs de fond
  background: '#FFFFFF',
  card: '#F8F9FA',
  
  // Couleurs de texte et bordures
  text: '#2B2D42', // Bleu très foncé presque noir - professionnalisme et lisibilité
  border: '#D9D9D9',
  
  // Couleurs de notification et d'état
  notification: '#F72585', // Rose fuchsia - attire l'attention immédiatement
  success: '#4CC9F0', // Cyan vif - frais et positif
  warning: '#F8961E', // Orange vif - chaleureux mais alerte
  info: '#4895EF', // Bleu ciel - informatif et apaisant
  danger: '#F72585', // Rose fuchsia - identique à notification pour cohérence
  
  // Couleurs supplémentaires pour les catégories d'événements
  category1: '#4CC9F0', // Cyan
  category2: '#4361EE', // Bleu électrique
  category3: '#3A0CA3', // Violet
  category4: '#7209B7', // Violet plus clair
  category5: '#F72585', // Rose
  category6: '#F8961E', // Orange
  category7: '#4ECB71', // Vert vif
};

const darkTheme = {
  // Couleurs principales avec plus de saturation pour être visibles sur fond sombre
  primary: '#4895EF', // Bleu légèrement plus clair pour contraste sur fond sombre
  secondary: '#7209B7', // Violet plus clair pour meilleure visibilité
  
  // Couleurs de fond
  background: '#121212',
  card: '#1E1E1E',
  
  // Couleurs de texte et bordures
  text: '#FFFFFF',
  border: '#2C2C2C',
  
  // Couleurs de notification et d'état - légèrement ajustées pour le thème sombre
  notification: '#F72585', // Rose fuchsia maintenu pour l'impact
  success: '#4CC9F0', // Cyan maintenu
  warning: '#F8961E', // Orange maintenu
  info: '#4895EF', // Bleu ciel maintenu
  danger: '#F72585', // Rose fuchsia maintenu
  
  // Couleurs de catégories - maintenues identiques pour la cohérence
  category1: '#4CC9F0', // Cyan
  category2: '#4361EE', // Bleu électrique
  category3: '#3A0CA3', // Violet
  category4: '#7209B7', // Violet plus clair
  category5: '#F72585', // Rose
  category6: '#F8961E', // Orange
  category7: '#4ECB71', // Vert vif
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
