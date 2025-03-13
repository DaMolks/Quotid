import SQLite from 'react-native-sqlite-storage';
import {Event} from '../models/Event';
import {getStartOfDay, getEndOfDay} from '../utils/dateUtils';

/**
 * Récupère tous les événements pour une date spécifique
 */
export const getEventsForDate = async (
  db: SQLite.SQLiteDatabase,
  date: Date,
): Promise<Event[]> => {
  const startOfDay = getStartOfDay(date).getTime();
  const endOfDay = getEndOfDay(date).getTime();

  try {
    const [result] = await db.executeSql(
      `SELECT e.*, c.color, c.emoji, c.notification_type as notificationType 
       FROM events e 
       LEFT JOIN categories c ON e.category_id = c.id 
       WHERE (e.start_time BETWEEN ? AND ?) OR (e.end_time BETWEEN ? AND ?)
       ORDER BY e.start_time ASC`,
      [startOfDay, endOfDay, startOfDay, endOfDay],
    );

    const events: Event[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      events.push({
        id: item.id,
        title: item.title,
        description: item.description,
        categoryId: item.category_id,
        startTime: item.start_time,
        endTime: item.end_time,
        location: item.location,
        isCompleted: Boolean(item.is_completed),
        isRecurring: Boolean(item.is_recurring),
        recurrenceRule: item.recurrence_rule,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        color: item.color,
        emoji: item.emoji,
        notificationType: item.notificationType,
      });
    }

    return events;
  } catch (error) {
    console.error('Error fetching events for date:', error);
    throw error;
  }
};

/**
 * Récupère un événement par son ID
 */
export const getEventById = async (
  db: SQLite.SQLiteDatabase,
  eventId: number,
): Promise<Event | null> => {
  try {
    const [result] = await db.executeSql(
      `SELECT e.*, c.color, c.emoji, c.notification_type as notificationType 
       FROM events e 
       LEFT JOIN categories c ON e.category_id = c.id 
       WHERE e.id = ?`,
      [eventId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const item = result.rows.item(0);
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
      startTime: item.start_time,
      endTime: item.end_time,
      location: item.location,
      isCompleted: Boolean(item.is_completed),
      isRecurring: Boolean(item.is_recurring),
      recurrenceRule: item.recurrence_rule,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      color: item.color,
      emoji: item.emoji,
      notificationType: item.notificationType,
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};

/**
 * Crée un nouvel événement
 */
export const createEvent = async (
  db: SQLite.SQLiteDatabase,
  event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> => {
  const now = Date.now();

  try {
    const [result] = await db.executeSql(
      `INSERT INTO events (
        title, description, category_id, start_time, end_time, location, 
        is_completed, is_recurring, recurrence_rule, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.description || null,
        event.categoryId || null,
        event.startTime,
        event.endTime,
        event.location || null,
        event.isCompleted ? 1 : 0,
        event.isRecurring ? 1 : 0,
        event.recurrenceRule || null,
        now,
        now,
      ],
    );

    return result.insertId;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Met à jour un événement existant
 */
export const updateEvent = async (
  db: SQLite.SQLiteDatabase,
  eventId: number,
  updates: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> => {
  const now = Date.now();
  const fields: string[] = [];
  const values: any[] = [];

  // Construire la requête SQL de manière dynamique
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description || null);
  }
  if (updates.categoryId !== undefined) {
    fields.push('category_id = ?');
    values.push(updates.categoryId || null);
  }
  if (updates.startTime !== undefined) {
    fields.push('start_time = ?');
    values.push(updates.startTime);
  }
  if (updates.endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.endTime);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location || null);
  }
  if (updates.isCompleted !== undefined) {
    fields.push('is_completed = ?');
    values.push(updates.isCompleted ? 1 : 0);
  }
  if (updates.isRecurring !== undefined) {
    fields.push('is_recurring = ?');
    values.push(updates.isRecurring ? 1 : 0);
  }
  if (updates.recurrenceRule !== undefined) {
    fields.push('recurrence_rule = ?');
    values.push(updates.recurrenceRule || null);
  }

  if (fields.length === 0) {
    return; // Rien à mettre à jour
  }

  fields.push('updated_at = ?');
  values.push(now);

  // Ajouter l'ID de l'événement aux valeurs
  values.push(eventId);

  try {
    await db.executeSql(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Supprime un événement
 */
export const deleteEvent = async (
  db: SQLite.SQLiteDatabase,
  eventId: number,
): Promise<void> => {
  try {
    await db.executeSql('DELETE FROM events WHERE id = ?', [eventId]);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Marque un événement comme complété ou non complété
 */
export const toggleEventCompletion = async (
  db: SQLite.SQLiteDatabase,
  eventId: number,
  isCompleted: boolean,
): Promise<void> => {
  const now = Date.now();

  try {
    await db.executeSql(
      'UPDATE events SET is_completed = ?, updated_at = ? WHERE id = ?',
      [isCompleted ? 1 : 0, now, eventId],
    );
  } catch (error) {
    console.error('Error toggling event completion:', error);
    throw error;
  }
};
