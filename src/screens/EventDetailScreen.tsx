import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
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
  const {scheduleNotification, cancelNotification, requestPermissions, hasPermission} = useNotification();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (database) {
        try {
          const loadedEvent = await getEventById(database, eventId);
          setEvent(loadedEvent);
          
          // Si l'événement est dans le futur et n'est pas marqué comme terminé,
          // nous supposons qu'une notification peut être active
          const eventInFuture = loadedEvent.startTime > Date.now();
          setNotificationEnabled(eventInFuture && !loadedEvent.isCompleted);
        } catch (error) {
          console.error('Error loading event:', error);
          Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
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
        setNotificationEnabled(false);
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
        'Impossible de mettre à jour l\'état de complétion de l\'événement',
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
                'Impossible de supprimer l\'événement',
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

  // Fonction pour gérer les notifications
  const handleNotificationToggle = async (value: boolean) => {
    if (!event) return;

    // Si l'événement est déjà passé, on ne peut pas activer de notification
    if (event.startTime < Date.now()) {
      Alert.alert(
        'Impossible',
        'Vous ne pouvez pas programmer de notification pour un événement déjà passé.'
      );
      return;
    }

    // Si l'événement est marqué comme terminé, on ne peut pas activer de notification
    if (event.isCompleted) {
      Alert.alert(
        'Impossible',
        'Vous ne pouvez pas programmer de notification pour un événement déjà terminé.'
      );
      return;
    }

    // Si on active les notifications
    if (value) {
      // Vérifier les permissions
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission refusée',
            'Vous devez autoriser les notifications pour utiliser cette fonctionnalité.'
          );
          return;
        }
      }

      // Programmation d'une notification 15 minutes avant l'événement
      const notificationTime = new Date(event.startTime);
      notificationTime.setMinutes(notificationTime.getMinutes() - 15);

      // Si le temps de notification est déjà passé, on programme une notification immédiate
      const now = new Date();
      if (notificationTime.getTime() < now.getTime()) {
        notificationTime.setTime(now.getTime() + 15000); // +15 secondes
      }

      // Programmer la notification
      scheduleNotification({
        id: `event-${event.id}`,
        title: `🔔 ${event.title}`,
        message: `Début ${notificationTime.getTime() < now.getTime() + 30000 ? 'imminent' : 'dans 15 minutes'}${event.location ? ` à ${event.location}` : ''}`,
        date: notificationTime,
        category: 'reminder',
        data: {eventId: event.id},
        autoCancel: true,
        autoCancelTime: 30, // Disparaît 30 minutes après
      });

      Alert.alert(
        'Notification programmée',
        `Vous recevrez une notification ${notificationTime.getTime() < now.getTime() + 30000 ? 'dans quelques instants' : '15 minutes avant le début de l\'événement'}.`
      );
    } else {
      // Annuler la notification
      cancelNotification(`event-${event.id}`);
    }

    setNotificationEnabled(value);
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

  // Déterminer si l'événement est passé, en cours, ou à venir
  const now = Date.now();
  const isPast = event.endTime < now;
  const isCurrent = event.startTime <= now && event.endTime >= now;
  const isFuture = event.startTime > now;

  // Texte du statut temporel
  let timeStatus = '';
  if (isPast) {
    timeStatus = 'Événement passé';
  } else if (isCurrent) {
    timeStatus = 'En cours';
  } else if (isFuture) {
    // Calculer le temps restant
    const diffMs = event.startTime - now;
    const diffDays = Math.floor(diffMs / 86400000); // jours
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // heures
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    
    if (diffDays > 0) {
      timeStatus = `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHrs > 0) {
      timeStatus = `Dans ${diffHrs} heure${diffHrs > 1 ? 's' : ''}`;
    } else {
      timeStatus = `Dans ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    }
  }

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

        {/* Badge de statut temporel */}
        <View style={[styles.timeStatusContainer, {
          backgroundColor: isPast ? theme.border : 
                          isCurrent ? theme.success : 
                          theme.info
        }]}>
          <Text style={styles.timeStatusText}>{timeStatus}</Text>
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

          {/* Notifications - Nouvelle section */}
          {isFuture && !event.isCompleted && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: theme.text}]}>
                Notifications
              </Text>
              <View style={styles.notificationContainer}>
                <View style={styles.notificationContent}>
                  <Icon name="bell-outline" size={24} color={theme.primary} />
                  <Text style={[styles.notificationText, {color: theme.text}]}>
                    Rappel 15 minutes avant
                  </Text>
                </View>
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{false: '#767577', true: theme.primary}}
                  thumbColor="#f4f3f4"
                  disabled={!isFuture || event.isCompleted}
                />
              </View>
            </View>
          )}

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
  timeStatusContainer: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timeStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
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
