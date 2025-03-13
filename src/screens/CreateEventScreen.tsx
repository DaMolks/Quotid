import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../context/ThemeContext';
import {useDatabase} from '../context/DatabaseContext';
import {useNotification} from '../context/NotificationContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Category} from '../models/Category';
import {createEvent} from '../services/eventService';
import {getAllCategories} from '../services/categoryService';
import {parseDate, formatDate} from '../utils/dateUtils';

type CreateEventScreenRouteProp = RouteProp<RootStackParamList, 'CreateEvent'>;
type CreateEventScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateEvent'
>;

type Props = {
  route: CreateEventScreenRouteProp;
  navigation: CreateEventScreenNavigationProp;
};

const CreateEventScreen = ({route, navigation}: Props) => {
  const {date: routeDate, categoryId: routeCategoryId} = route.params || {};
  const {theme} = useTheme();
  const {database} = useDatabase();
  const {scheduleNotification} = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    routeCategoryId || null,
  );

  const initialDate = routeDate ? parseDate(routeDate) : new Date();
  initialDate.setMinutes(Math.ceil(initialDate.getMinutes() / 15) * 15); // Arrondir au quart d'heure supérieur

  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(() => {
    const newEndDate = new Date(initialDate);
    newEndDate.setHours(initialDate.getHours() + 1);
    return newEndDate;
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      if (database) {
        setIsLoading(true);
        try {
          const loadedCategories = await getAllCategories(database);
          setCategories(loadedCategories);
        } catch (error) {
          console.error('Error loading categories:', error);
          Alert.alert('Erreur', 'Impossible de charger les catégories');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCategories();
  }, [database]);

  // Gérer le changement de date de début
  const handleStartDateChange = (event, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowStartTimePicker(false);
    }

    if (selectedDate) {
      // Conserver seulement la date, pas l'heure
      const currentStartDate = new Date(startDate);
      selectedDate.setHours(currentStartDate.getHours());
      selectedDate.setMinutes(currentStartDate.getMinutes());

      setStartDate(selectedDate);

      // Mettre à jour la date de fin pour correspondre
      const newEndDate = new Date(endDate);
      newEndDate.setFullYear(selectedDate.getFullYear());
      newEndDate.setMonth(selectedDate.getMonth());
      newEndDate.setDate(selectedDate.getDate());
      setEndDate(newEndDate);
    }
  };

  // Gérer le changement d'heure de début
  const handleStartTimeChange = (event, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }

    if (selectedTime) {
      // Conserver seulement l'heure, pas la date
      const newStartDate = new Date(startDate);
      newStartDate.setHours(selectedTime.getHours());
      newStartDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newStartDate);

      // Ajuster l'heure de fin si nécessaire (pour avoir au moins 15 minutes entre début et fin)
      if (endDate.getTime() - newStartDate.getTime() < 15 * 60 * 1000) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setMinutes(newEndDate.getMinutes() + 30);
        setEndDate(newEndDate);
      }
    }
  };

  // Gérer le changement d'heure de fin
  const handleEndTimeChange = (event, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }

    if (selectedTime) {
      // Conserver seulement l'heure, pas la date
      const newEndDate = new Date(endDate);
      newEndDate.setHours(selectedTime.getHours());
      newEndDate.setMinutes(selectedTime.getMinutes());

      // Vérifier que l'heure de fin est après l'heure de début
      if (newEndDate.getTime() <= startDate.getTime()) {
        Alert.alert(
          'Erreur',
          "L'heure de fin doit être postérieure à l'heure de début.",
        );
        return;
      }

      setEndDate(newEndDate);
    }
  };

  // Sélectionner une catégorie
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(
      selectedCategoryId === categoryId ? null : categoryId,
    );
  };

  // Valider et créer l'événement
  const handleCreateEvent = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      Alert.alert(
        'Erreur',
        "L'heure de fin doit être postérieure à l'heure de début.",
      );
      return;
    }

    if (!database) {
      Alert.alert('Erreur', 'Base de données non disponible');
      return;
    }

    setIsSaving(true);

    try {
      // Trouver la catégorie sélectionnée pour les infos de notification
      const selectedCategory = categories.find(
        cat => cat.id === selectedCategoryId,
      );

      // Créer l'événement
      const eventId = await createEvent(database, {
        title,
        description,
        categoryId: selectedCategoryId,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        location,
        isCompleted: false,
        isRecurring: false,
      });

      // Programmer une notification si une catégorie est sélectionnée
      if (selectedCategory && selectedCategory.notificationType) {
        // Notification 15 minutes avant
        const notificationTime = new Date(startDate);
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);

        if (notificationTime.getTime() > Date.now()) {
          scheduleNotification({
            id: `event-${eventId}`,
            title: `🔔 ${title}`,
            message: `Début dans 15 minutes${location ? ` à ${location}` : ''}`,
            date: notificationTime,
            category: selectedCategory.notificationType,
            data: {eventId},
            autoCancel: true,
            autoCancelTime: 30, // La notification disparaîtra 30 minutes après le début de l'événement
          });
        }
      }

      // Retourner au calendrier
      navigation.goBack();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Erreur', "Impossible de créer l'événement");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView style={styles.scrollView}>
        {/* Titre */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Titre *</Text>
          <TextInput
            style={[
              styles.input,
              {backgroundColor: theme.card, color: theme.text},
            ]}
            placeholder="Titre de l'événement"
            placeholderTextColor={theme.border}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Catégories */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Catégorie</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategoryId === category.id
                        ? category.color
                        : theme.card,
                    borderColor: category.color,
                  },
                ]}
                onPress={() => handleCategorySelect(category.id)}>
                {category.emoji && (
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                )}
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color:
                        selectedCategoryId === category.id
                          ? '#ffffff'
                          : theme.text,
                    },
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Date</Text>
          <TouchableOpacity
            style={[
              styles.dateTimePicker,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={theme.text} />
            <Text style={[styles.dateTimeText, {color: theme.text}]}>
              {formatDateDisplay(startDate)}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
              locale="fr-FR"
            />
          )}
        </View>

        {/* Heure de début */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Heure de début</Text>
          <TouchableOpacity
            style={[
              styles.dateTimePicker,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => setShowStartTimePicker(true)}>
            <Icon name="clock-outline" size={20} color={theme.text} />
            <Text style={[styles.dateTimeText, {color: theme.text}]}>
              {formatTimeDisplay(startDate)}
            </Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleStartTimeChange}
              locale="fr-FR"
            />
          )}
        </View>

        {/* Heure de fin */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Heure de fin</Text>
          <TouchableOpacity
            style={[
              styles.dateTimePicker,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => setShowEndTimePicker(true)}>
            <Icon name="clock-outline" size={20} color={theme.text} />
            <Text style={[styles.dateTimeText, {color: theme.text}]}>
              {formatTimeDisplay(endDate)}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleEndTimeChange}
              locale="fr-FR"
            />
          )}
        </View>

        {/* Lieu */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Lieu</Text>
          <TextInput
            style={[
              styles.input,
              {backgroundColor: theme.card, color: theme.text},
            ]}
            placeholder="Lieu de l'événement (optionnel)"
            placeholderTextColor={theme.border}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, {color: theme.text}]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {backgroundColor: theme.card, color: theme.text},
            ]}
            placeholder="Description (optionnel)"
            placeholderTextColor={theme.border}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton de création */}
        <TouchableOpacity
          style={[styles.createButton, {backgroundColor: theme.primary}]}
          onPress={handleCreateEvent}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="plus" size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Créer l'événement</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  dateTimePicker: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreateEventScreen;
