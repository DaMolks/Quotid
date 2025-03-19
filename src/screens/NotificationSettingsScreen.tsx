import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../context/ThemeContext';
import {useNotification} from '../context/NotificationContext';
import {NotificationPreferences} from '../models/Notification';

const NotificationSettingsScreen = () => {
  const {theme} = useTheme();
  const {
    preferences,
    updatePreferences,
    hasPermission,
    requestPermissions,
  } = useNotification();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(
    preferences
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les préférences initiales
  useEffect(() => {
    setLocalPreferences(preferences);
    setIsLoading(false);
  }, [preferences]);

  // Mettre à jour les préférences globales
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localPreferences);
      Alert.alert('Succès', 'Préférences de notification enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      Alert.alert('Erreur', 'Échec de l\'enregistrement des préférences');
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le changement d'état global des notifications
  const handleToggleNotifications = (value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      enabled: value,
    }));
  };

  // Gérer le changement d'état pour une catégorie spécifique
  const handleToggleCategory = (category: string, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          enabled: value,
        },
      },
    }));
  };

  // Gérer le changement de son pour une catégorie
  const handleToggleSound = (category: string, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          sound: value,
        },
      },
    }));
  };

  // Gérer le changement de vibration pour une catégorie
  const handleToggleVibration = (category: string, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          vibration: value,
        },
      },
    }));
  };

  // Gérer le changement de délai de rappel
  const handleChangeReminderDelay = (value: number) => {
    setLocalPreferences(prev => ({
      ...prev,
      reminderDelay: value,
    }));
  };

  // Liste des catégories avec leurs icônes et descriptions
  const categoryInfo = {
    default: {
      name: 'Général',
      icon: 'bell-outline',
      description: 'Notifications générales de l\'application',
    },
    reminder: {
      name: 'Rappels',
      icon: 'alarm',
      description: 'Rappels importants pour les événements à venir',
    },
    system: {
      name: 'Système',
      icon: 'cog-outline',
      description: 'Notifications techniques de l\'application',
    },
    interactive: {
      name: 'Interactives',
      icon: 'gesture-tap',
      description: 'Notifications avec boutons d\'action',
    },
    sport: {
      name: 'Sport',
      icon: 'run',
      description: 'Rappels pour les activités sportives',
    },
    meal: {
      name: 'Repas',
      icon: 'food-fork-drink',
      description: 'Rappels pour les repas',
    },
    housework: {
      name: 'Tâches ménagères',
      icon: 'broom',
      description: 'Rappels pour les tâches ménagères',
    },
  };

  // Délais de rappel disponibles
  const reminderDelays = [
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 heure' },
    { value: 120, label: '2 heures' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}>
      
      {/* En-tête */}
      <View style={styles.header}>
        <Icon name="bell-outline" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Préférences de notification
        </Text>
      </View>

      {/* Section permissions */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Autorisations
            </Text>
            <Text style={[styles.permissionText, { color: theme.text }]}>
              {hasPermission
                ? 'Notifications autorisées'
                : 'Notifications non autorisées'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              {
                backgroundColor: hasPermission ? theme.success : theme.primary,
              },
            ]}
            onPress={requestPermissions}
            disabled={hasPermission}>
            <Text style={styles.permissionButtonText}>
              {hasPermission ? 'Autorisé' : 'Autoriser'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section principale */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* Toggle principal */}
        <View style={styles.mainToggleContainer}>
          <View style={styles.toggleTextContainer}>
            <Text style={[styles.toggleTitle, { color: theme.text }]}>
              Activer toutes les notifications
            </Text>
            <Text style={[styles.toggleDescription, { color: theme.text }]}>
              Active ou désactive toutes les notifications
            </Text>
          </View>
          <Switch
            value={localPreferences.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={localPreferences.enabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Paramètres par catégorie */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>
        Paramètres par catégorie
      </Text>

      {Object.entries(localPreferences.categories).map(([category, settings]) => {
        const info = categoryInfo[category as keyof typeof categoryInfo];
        
        // Si cette catégorie n'a pas d'info, la sauter
        if (!info) return null;
        
        return (
          <View
            key={category}
            style={[
              styles.categoryCard,
              {
                backgroundColor: theme.card,
                opacity: !localPreferences.enabled ? 0.5 : 1,
              },
            ]}>
            {/* En-tête de catégorie avec toggle principal */}
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <Icon name={info.icon} size={24} color={theme.primary} />
                <Text style={[styles.categoryTitle, { color: theme.text }]}>
                  {info.name}
                </Text>
              </View>
              <Switch
                value={settings.enabled && localPreferences.enabled}
                onValueChange={value => handleToggleCategory(category, value)}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={settings.enabled ? '#f4f3f4' : '#f4f3f4'}
                disabled={!localPreferences.enabled}
              />
            </View>

            <Text
              style={[styles.categoryDescription, { color: theme.text }]}>
              {info.description}
            </Text>

            {/* Options supplémentaires de la catégorie */}
            <View
              style={[
                styles.categoryOptions,
                {
                  opacity:
                    settings.enabled && localPreferences.enabled ? 1 : 0.5,
                },
              ]}>
              {/* Option son */}
              <View style={styles.optionContainer}>
                <View style={styles.optionTextContainer}>
                  <Icon name="volume-high" size={18} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    Son
                  </Text>
                </View>
                <Switch
                  value={settings.sound}
                  onValueChange={value => handleToggleSound(category, value)}
                  trackColor={{ false: '#767577', true: theme.primary }}
                  thumbColor={settings.sound ? '#f4f3f4' : '#f4f3f4'}
                  disabled={!(settings.enabled && localPreferences.enabled)}
                />
              </View>

              {/* Option vibration */}
              <View style={styles.optionContainer}>
                <View style={styles.optionTextContainer}>
                  <Icon name="vibrate" size={18} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    Vibration
                  </Text>
                </View>
                <Switch
                  value={settings.vibration}
                  onValueChange={value => handleToggleVibration(category, value)}
                  trackColor={{ false: '#767577', true: theme.primary }}
                  thumbColor={settings.vibration ? '#f4f3f4' : '#f4f3f4'}
                  disabled={!(settings.enabled && localPreferences.enabled)}
                />
              </View>
            </View>
          </View>
        );
      })}

      {/* Section délais de rappel */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>
        Délai de rappel
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardDescription, { color: theme.text }]}>
          Délai après lequel une notification non consultée sera renvoyée
        </Text>

        <View style={styles.delayContainer}>
          {reminderDelays.map(delay => (
            <TouchableOpacity
              key={delay.value}
              style={[
                styles.delayButton,
                {
                  backgroundColor:
                    localPreferences.reminderDelay === delay.value
                      ? theme.primary
                      : theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleChangeReminderDelay(delay.value)}>
              <Text
                style={[
                  styles.delayButtonText,
                  {
                    color:
                      localPreferences.reminderDelay === delay.value
                        ? '#ffffff'
                        : theme.text,
                  },
                ]}>
                {delay.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSavePreferences}
        disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionContent: {
    flex: 1,
  },
  permissionText: {
    marginTop: 4,
    fontSize: 14,
  },
  permissionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mainToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryDescription: {
    marginTop: 4,
    fontSize: 14,
    marginBottom: 12,
  },
  categoryOptions: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  delayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  delayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  delayButtonText: {
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotificationSettingsScreen;
