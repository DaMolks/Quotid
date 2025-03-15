import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useTheme} from '../context/ThemeContext';
import {useNotification} from '../context/NotificationContext';

const SettingsScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {cancelAllNotifications, requestPermissions} = useNotification();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Activer/désactiver les notifications
  const handleNotificationsToggle = (value: boolean) => {
    if (value) {
      // Si on active les notifications, demander les permissions
      requestPermissions();
    } else {
      // Si les notifications sont désactivées, annuler toutes les notifications existantes
      cancelAllNotifications();
    }
    
    setNotificationsEnabled(value);
  };

  // Effacer toutes les données
  const handleClearData = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            // Cette fonctionnalité sera implémentée ultérieurement
            Alert.alert(
              'Information',
              'Fonctionnalité non disponible pour le moment',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView style={styles.scrollView}>
        {/* Thème */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Apparence
          </Text>
          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="theme-light-dark" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Thème sombre
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: '#767577', true: theme.primary}}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Notifications
          </Text>
          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="bell-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Activer les notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: '#767577', true: theme.primary}}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={requestPermissions}>
            <View style={styles.settingContent}>
              <Icon name="bell-ring-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Demander les permissions
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Catégories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Catégories
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => {
              // Cette fonctionnalité sera implémentée ultérieurement
              Alert.alert(
                'Information',
                'Fonctionnalité non disponible pour le moment',
              );
            }}>
            <View style={styles.settingContent}>
              <Icon name="tag-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Gérer les catégories
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Données */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Données
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={handleClearData}>
            <View style={styles.settingContent}>
              <Icon name="delete-outline" size={24} color={theme.danger} />
              <Text style={[styles.settingTitle, {color: theme.danger}]}>
                Effacer toutes les données
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            À propos
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => {
              // Ouvrir le lien vers le dépôt GitHub
              Linking.openURL('https://github.com/DaMolks/Quotid');
            }}>
            <View style={styles.settingContent}>
              <Icon name="github" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Dépôt GitHub
              </Text>
            </View>
            <Icon name="open-in-new" size={24} color={theme.text} />
          </TouchableOpacity>

          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="information-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Version
              </Text>
            </View>
            <Text style={[styles.versionText, {color: theme.text}]}>
              0.1.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
