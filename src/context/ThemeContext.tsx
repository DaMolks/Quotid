import React, {createContext, useState, useContext, ReactNode} from 'react';

// Définition des couleurs du thème basé sur le logo
const lightTheme = {
  primary: '#3498db', // Bleu principal du logo
  secondary: '#2980b9', // Bleu secondaire plus foncé
  background: '#ffffff',
  card: '#f8f9fa',
  text: '#333333',
  border: '#e0e0e0',
  notification: '#ff3b30',
  success: '#4cd964',
  warning: '#ffcc00',
  info: '#34aadc',
  danger: '#ff3b30',
};

const darkTheme = {
  primary: '#3498db',
  secondary: '#2980b9',
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  border: '#2c2c2c',
  notification: '#ff453a',
  success: '#32d74b',
  warning: '#ffd60a',
  info: '#0a84ff',
  danger: '#ff453a',
};

type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
