import SQLite from 'react-native-sqlite-storage';
import {formatDate, parseDate, getStartOfDay, getEndOfDay} from '../utils/dateUtils';

interface StatsByCategory {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  completedCount: number;
  plannedCount: number;
  completionRate: number; // En pourcentage
}

interface StatsOverTime {
  date: string;
  completedCount: number;
  plannedCount: number;
  completionRate: number; // En pourcentage
}

/**
 * Met à jour les statistiques pour un événement terminé ou non terminé
 */
export const updateStatsForEvent = async (
  db: SQLite.SQLiteDatabase,
  eventId: number,
  isCompleted: boolean,
): Promise<void> => {
  try {
    // Récupérer les informations de l'événement
    const [eventResult] = await db.executeSql(
      'SELECT category_id, start_time FROM events WHERE id = ?',
      [eventId],
    );

    if (eventResult.rows.length === 0) {
      console.warn(`No event found with ID ${eventId}`);
      return;
    }

    const event = eventResult.rows.item(0);
    const categoryId = event.category_id;
    const eventDate = new Date(event.start_time);
    const dateString = formatDate(eventDate);

    // Si aucune catégorie n'est associée, ne pas mettre à jour les stats
    if (!categoryId) {
      return;
    }

    // Vérifier si des statistiques existent déjà pour cette catégorie et cette date
    const [statsResult] = await db.executeSql(
      'SELECT id, completed_count, planned_count FROM stats WHERE category_id = ? AND date = ?',
      [categoryId, eventDate.getTime()],
    );

    if (statsResult.rows.length > 0) {
      // Mettre à jour les statistiques existantes
      const stats = statsResult.rows.item(0);
      let completedCount = stats.completed_count;

      // Ajuster le compteur de tâches terminées
      if (isCompleted) {
        completedCount += 1;
      }

      await db.executeSql(
        'UPDATE stats SET completed_count = ? WHERE id = ?',
        [completedCount, stats.id],
      );
    } else {
      // Créer une nouvelle entrée de statistiques
      await db.executeSql(
        'INSERT INTO stats (category_id, date, completed_count, planned_count) VALUES (?, ?, ?, ?)',
        [categoryId, eventDate.getTime(), isCompleted ? 1 : 0, 1],
      );
    }
  } catch (error) {
    console.error('Error updating stats for event:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques par catégorie pour une période donnée
 */
export const getStatsByCategory = async (
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date,
): Promise<StatsByCategory[]> => {
  try {
    const startTimestamp = getStartOfDay(startDate).getTime();
    const endTimestamp = getEndOfDay(endDate).getTime();

    const [result] = await db.executeSql(
      `SELECT 
        c.id as categoryId, 
        c.name as categoryName, 
        c.color as categoryColor,
        SUM(s.completed_count) as totalCompleted, 
        SUM(s.planned_count) as totalPlanned
      FROM stats s
      JOIN categories c ON s.category_id = c.id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY s.category_id
      ORDER BY totalPlanned DESC`,
      [startTimestamp, endTimestamp],
    );

    const stats: StatsByCategory[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const completedCount = item.totalCompleted || 0;
      const plannedCount = item.totalPlanned || 0;
      const completionRate = plannedCount > 0 ? (completedCount / plannedCount) * 100 : 0;

      stats.push({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryColor: item.categoryColor,
        completedCount,
        plannedCount,
        completionRate: parseFloat(completionRate.toFixed(1)),
      });
    }

    return stats;
  } catch (error) {
    console.error('Error fetching stats by category:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques globales sur une période donnée, groupées par jour
 */
export const getStatsOverTime = async (
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date,
): Promise<StatsOverTime[]> => {
  try {
    const startTimestamp = getStartOfDay(startDate).getTime();
    const endTimestamp = getEndOfDay(endDate).getTime();

    // Récupérer toutes les statistiques dans la période
    const [result] = await db.executeSql(
      `SELECT 
        s.date,
        SUM(s.completed_count) as totalCompleted, 
        SUM(s.planned_count) as totalPlanned
      FROM stats s
      WHERE s.date BETWEEN ? AND ?
      GROUP BY s.date
      ORDER BY s.date ASC`,
      [startTimestamp, endTimestamp],
    );

    const stats: StatsOverTime[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const completedCount = item.totalCompleted || 0;
      const plannedCount = item.totalPlanned || 0;
      const completionRate = plannedCount > 0 ? (completedCount / plannedCount) * 100 : 0;
      const date = formatDate(new Date(item.date));

      stats.push({
        date,
        completedCount,
        plannedCount,
        completionRate: parseFloat(completionRate.toFixed(1)),
      });
    }

    return stats;
  } catch (error) {
    console.error('Error fetching stats over time:', error);
    throw error;
  }
};

/**
 * Récupère un résumé des statistiques pour une période donnée
 */
export const getStatsSummary = async (
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date,
) => {
  try {
    const startTimestamp = getStartOfDay(startDate).getTime();
    const endTimestamp = getEndOfDay(endDate).getTime();

    // Statistiques globales
    const [globalResult] = await db.executeSql(
      `SELECT 
        SUM(s.completed_count) as totalCompleted, 
        SUM(s.planned_count) as totalPlanned
      FROM stats s
      WHERE s.date BETWEEN ? AND ?`,
      [startTimestamp, endTimestamp],
    );

    const totalCompleted = globalResult.rows.item(0).totalCompleted || 0;
    const totalPlanned = globalResult.rows.item(0).totalPlanned || 0;
    const globalCompletionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;

    // Catégorie la plus complétée
    const [bestCategoryResult] = await db.executeSql(
      `SELECT 
        c.id as categoryId, 
        c.name as categoryName, 
        c.color as categoryColor,
        SUM(s.completed_count) as totalCompleted, 
        SUM(s.planned_count) as totalPlanned,
        (SUM(s.completed_count) * 100.0 / SUM(s.planned_count)) as completionRate
      FROM stats s
      JOIN categories c ON s.category_id = c.id
      WHERE s.date BETWEEN ? AND ? AND s.planned_count > 0
      GROUP BY s.category_id
      ORDER BY completionRate DESC
      LIMIT 1`,
      [startTimestamp, endTimestamp],
    );

    let bestCategory = null;
    if (bestCategoryResult.rows.length > 0) {
      const item = bestCategoryResult.rows.item(0);
      bestCategory = {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryColor: item.categoryColor,
        completionRate: parseFloat(item.completionRate.toFixed(1)),
      };
    }

    // Catégorie la moins complétée
    const [worstCategoryResult] = await db.executeSql(
      `SELECT 
        c.id as categoryId, 
        c.name as categoryName, 
        c.color as categoryColor,
        SUM(s.completed_count) as totalCompleted, 
        SUM(s.planned_count) as totalPlanned,
        (SUM(s.completed_count) * 100.0 / SUM(s.planned_count)) as completionRate
      FROM stats s
      JOIN categories c ON s.category_id = c.id
      WHERE s.date BETWEEN ? AND ? AND s.planned_count > 0
      GROUP BY s.category_id
      ORDER BY completionRate ASC
      LIMIT 1`,
      [startTimestamp, endTimestamp],
    );

    let worstCategory = null;
    if (worstCategoryResult.rows.length > 0) {
      const item = worstCategoryResult.rows.item(0);
      worstCategory = {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryColor: item.categoryColor,
        completionRate: parseFloat(item.completionRate.toFixed(1)),
      };
    }

    return {
      totalCompleted,
      totalPlanned,
      globalCompletionRate: parseFloat(globalCompletionRate.toFixed(1)),
      bestCategory,
      worstCategory,
    };
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    throw error;
  }
};
