import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Calendar, DateData, LocaleConfig} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../context/ThemeContext';
import {useDatabase} from '../context/DatabaseContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {formatDate, parseDate, getMonthName} from '../utils/dateUtils';
import {Event} from '../models/Event';
import {getEventsForDate} from '../services/eventService';

// Configuration des locales pour le calendrier
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'fr';

type CalendarScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const {theme} = useTheme();
  const {database, isLoading} = useDatabase();

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Charger les événements pour la date sélectionnée
  useEffect(() => {
    const loadEvents = async () => {
      if (database && selectedDate) {
        setIsLoadingEvents(true);
        try {
          const date = parseDate(selectedDate);
          const fetchedEvents = await getEventsForDate(database, date);
          setEvents(fetchedEvents);
        } catch (error) {
          console.error('Error loading events:', error);
        } finally {
          setIsLoadingEvents(false);
        }
      }
    };

    loadEvents();
  }, [database, selectedDate]);

  // Gestionnaire de changement de date
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // Gestionnaire de changement de mois
  const handleMonthChange = (month: DateData) => {
    setCurrentMonth(new Date(month.timestamp));
  };

  // Naviguer vers l'écran de détail d'un événement
  const navigateToEventDetail = (eventId: number) => {
    navigation.navigate('EventDetail', {eventId});
  };

  // Naviguer vers l'écran de création d'événement
  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent', {date: selectedDate});
  };

  // Fonction de rendu personnalisée pour l'en-tête du calendrier
  const renderCustomHeader = (date: any) => {
    const headerDate = new Date(date);
    const monthYear = `${getMonthName(headerDate)} ${headerDate.getFullYear()}`;
    
    return (
      <Text style={{fontSize: 16, fontWeight: 'bold', color: theme.text}}>
        {monthYear}
      </Text>
    );
  };

  // Rendu d'un élément de la liste des événements
  const renderEventItem = ({item}: {item: Event}) => {
    const startTime = new Date(item.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(item.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={[styles.eventItem, {backgroundColor: item.color || theme.card}]}
        onPress={() => navigateToEventDetail(item.id)}>
        <View style={styles.eventTimeContainer}>
          <Text style={[styles.eventTime, {color: theme.text}]}>
            {startTime}
          </Text>
          <Text style={[styles.eventTimeSeparator, {color: theme.text}]}>
            -
          </Text>
          <Text style={[styles.eventTime, {color: theme.text}]}>
            {endTime}
          </Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, {color: theme.text}]}>
            {item.emoji ? `${item.emoji} ${item.title}` : item.title}
          </Text>
          {item.location ? (
            <Text style={[styles.eventLocation, {color: theme.text}]}>
              📍 {item.location}
            </Text>
          ) : null}
        </View>
        <View style={styles.eventStatus}>
          {item.isCompleted ? (
            <Icon name="check-circle" size={24} color={theme.success} />
          ) : (
            <Icon name="circle-outline" size={24} color={theme.text} />
          )}
        </View>
      </TouchableOpacity>
    );
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
      <Calendar
        theme={{
          calendarBackground: theme.card,
          textSectionTitleColor: theme.text,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.primary,
          dayTextColor: theme.text,
          textDisabledColor: theme.border,
          dotColor: theme.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.primary,
          monthTextColor: theme.text,
          indicatorColor: theme.primary,
        }}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={{
          ...markedDates,
          [selectedDate]: {selected: true, selectedColor: theme.primary},
        }}
        enableSwipeMonths={true}
        hideExtraDays={false}
        hideDayNames={false}
        // Utiliser notre fonction de rendu personnalisée pour l'en-tête
        customHeader={renderCustomHeader}
        disableMonthChange={false}
      />

      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={[styles.eventsTitle, {color: theme.text}]}>
            Événements du jour
          </Text>
          <TouchableOpacity
            style={[styles.addButton, {backgroundColor: theme.primary}]}
            onPress={navigateToCreateEvent}>
            <Icon name="plus" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {isLoadingEvents ? (
          <ActivityIndicator
            style={styles.eventsLoading}
            size="small"
            color={theme.primary}
          />
        ) : events.length > 0 ? (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        ) : (
          <View style={styles.noEventsContainer}>
            <Icon name="calendar-blank" size={48} color={theme.border} />
            <Text style={[styles.noEventsText, {color: theme.text}]}>
              Pas d'événements prévus pour cette date
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventsList: {
    paddingBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTime: {
    fontSize: 12,
  },
  eventTimeSeparator: {
    marginHorizontal: 2,
    fontSize: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
  },
  eventStatus: {
    marginLeft: 8,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEventsText: {
    marginTop: 16,
    fontSize: 16,
  },
  eventsLoading: {
    marginTop: 32,
  },
});

export default CalendarScreen;
