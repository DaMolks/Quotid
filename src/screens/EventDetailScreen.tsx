import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../context/ThemeContext';
import {useDatabase} from '../context/DatabaseContext';
import {useNotification} from '../context/NotificationContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Event} from '../models/Event';
import {
  getEventById,
  toggleEventCompletion,
  deleteEvent,
} from '../services/eventService';
import {formatDate, getDayName, getMonthName, formatDuration} from '../utils/dateUtils';
import {updateStatsForEvent} from '../services/statsService';

type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;
type EventDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EventDetail'
>;

type Props = {
  route: EventDetailScreenRouteProp;
  navigation: EventDetailScreenNavigationProp;
};

const EventDetailScreen = ({route, navigation}: Props) => {
  const {eventId} = route.params;
  const {theme} = useTheme();
  const {database} = useDatabase();
  const {cancelNotification} = useNotification();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (database) {
        try {
          const loadedEvent = await getEventById(database, eventId);
          setEvent(loadedEvent);
        } catch (error) {
          console.error('Error loading event:', error);
          Alert.alert('Erreur', 'Impossible de charger les détails de l\'\u00e9vénement');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadEvent();
  }, [database, eventId]);

  // Mettre à jour le titre de la navigation avec le titre de l'événement
  useEffect(() => {
    if (event) {
      navigation.setOptions({
        title: event.emoji ? `${event.emoji} ${event.title}` : event.title,
      });
    }
  }, [event, navigation]);

  // Fonction pour basculer l'état de complétion de l'événement
  const handleToggleCompletion = async () => {
    if (!database || !event) return;

    const newCompletionState = !event.isCompleted;

    try {
      await toggleEventCompletion(database, event.id, newCompletionState);
      await updateStatsForEvent(database, event.id, newCompletionState);

      // Si l'événement est marqué comme terminé, annuler toute notification associée
      if (newCompletionState) {
        cancelNotification(`event-${event.id}`);
      }

      // Mettre à jour l'état local
      setEvent({
        ...event,
        isCompleted: newCompletionState,
      });
    } catch (error) {
      console.error('Error toggling completion state:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour l\'\u00e9tat de complétion de l\'\u00e9vénement',
      );
    }
  };

  // Fonction pour supprimer l'événement
  const handleDeleteEvent = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet événement ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!database || !event) return;

            try {
              await deleteEvent(database, event.id);
              cancelNotification(`event-${event.id}`);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert(
                'Erreur',
                'Impossible de supprimer l\'\u00e9vénement',
              );
            }
          },
        },
      ],
    );
  };

  // Fonction pour éditer l'événement
  const handleEditEvent = () => {
    // Cette fonctionnalité sera implémentée ultérieurement
    // navigation.navigate('EditEvent', {eventId: event.id});
    Alert.alert('Information', 'Fonctionnalité non disponible pour le moment');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style={[styles.errorText, {color: theme.text}]}>
          Événement introuvable
        </Text>
      </View>
    );
  }

  const eventDate = new Date(event.startTime);
  const startTime = new Date(event.startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(event.endTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const duration = formatDuration(
    Math.round((event.endTime - event.startTime) / 60000),
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête de l'événement */}
        <View
          style={[
            styles.header,
            {backgroundColor: event.color || theme.primary},
          ]}>
          <View style={styles.dateContainer}>
            <Text style={styles.dayOfWeek}>
              {getDayName(eventDate, true)}
            </Text>
            <Text style={styles.dayOfMonth}>{eventDate.getDate()}</Text>
            <Text style={styles.month}>
              {getMonthName(eventDate, true)}
            </Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.eventTime}>
              {startTime} - {endTime}
            </Text>
            <Text style={styles.duration}>{duration}</Text>
          </View>
        </View>

        {/* Détails de l'événement */}
        <View style={styles.detailsContainer}>
          {/* Description */}
          {event.description ? (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, {color: theme.text}]}>
                Description
              </Text>
              <Text style={[styles.description, {color: theme.text}]}>
                {event.description}
              </Text>
            </View>
          ) : null}

          {/* Localisation */}
          {event.location ? (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, {color: theme.text}]}>
                Lieu
              </Text>
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={20} color={theme.text} />
                <Text style={[styles.locationText, {color: theme.text}]}>
                  {event.location}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Statut de complétion */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Statut
            </Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, {color: theme.text}]}>
                {event.isCompleted ? 'Terminé' : 'En attente'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: event.isCompleted
                      ? theme.success
                      : theme.card,
                    borderColor: event.isCompleted
                      ? theme.success
                      : theme.border,
                  },
                ]}
                onPress={handleToggleCompletion}>
                <Icon
                  name={event.isCompleted ? 'check' : 'clock-outline'}
                  size={24}
                  color={event.isCompleted ? '#ffffff' : theme.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barre d'actions */}
      <View
        style={[
          styles.actionBar,
          {backgroundColor: theme.card, borderTopColor: theme.border},
        ]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditEvent}>
          <Icon name="pencil" size={24} color={theme.primary} />
          <Text style={[styles.actionText, {color: theme.primary}]}>
            Modifier
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteEvent}>
          <Icon name="delete" size={24} color={theme.danger} />
          <Text style={[styles.actionText, {color: theme.danger}]}>
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  dateContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dayOfWeek: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayOfMonth: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  month: {
    color: 'white',
    fontSize: 12,
  },
  headerContent: {
    flex: 1,
  },
  eventTime: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  duration: {
    color: 'white',
    fontSize: 14,
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 16,
  },
  statusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});

export default EventDetailScreen;
