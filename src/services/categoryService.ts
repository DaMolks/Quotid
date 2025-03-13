import SQLite from 'react-native-sqlite-storage';
import {Category} from '../models/Category';

/**
 * Récupère toutes les catégories
 */
export const getAllCategories = async (
  db: SQLite.SQLiteDatabase,
): Promise<Category[]> => {
  try {
    const [result] = await db.executeSql(
      'SELECT * FROM categories ORDER BY name ASC',
    );

    const categories: Category[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      categories.push({
        id: item.id,
        name: item.name,
        color: item.color,
        emoji: item.emoji,
        notificationType: item.notification_type,
        createdAt: item.created_at,
      });
    }

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son ID
 */
export const getCategoryById = async (
  db: SQLite.SQLiteDatabase,
  categoryId: number,
): Promise<Category | null> => {
  try {
    const [result] = await db.executeSql(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const item = result.rows.item(0);
    return {
      id: item.id,
      name: item.name,
      color: item.color,
      emoji: item.emoji,
      notificationType: item.notification_type,
      createdAt: item.created_at,
    };
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle catégorie
 */
export const createCategory = async (
  db: SQLite.SQLiteDatabase,
  category: Omit<Category, 'id' | 'createdAt'>,
): Promise<number> => {
  const now = Date.now();

  try {
    const [result] = await db.executeSql(
      'INSERT INTO categories (name, color, emoji, notification_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        category.name,
        category.color,
        category.emoji || null,
        category.notificationType || null,
        now,
      ],
    );

    return result.insertId;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Met à jour une catégorie existante
 */
export const updateCategory = async (
  db: SQLite.SQLiteDatabase,
  categoryId: number,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>,
): Promise<void> => {
  const fields: string[] = [];
  const values: any[] = [];

  // Construire la requête SQL de manière dynamique
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.emoji !== undefined) {
    fields.push('emoji = ?');
    values.push(updates.emoji || null);
  }
  if (updates.notificationType !== undefined) {
    fields.push('notification_type = ?');
    values.push(updates.notificationType || null);
  }

  if (fields.length === 0) {
    return; // Rien à mettre à jour
  }

  // Ajouter l'ID de la catégorie aux valeurs
  values.push(categoryId);

  try {
    await db.executeSql(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Supprime une catégorie
 */
export const deleteCategory = async (
  db: SQLite.SQLiteDatabase,
  categoryId: number,
): Promise<void> => {
  try {
    // Commencer une transaction pour maintenir l'intégrité des données
    await db.transaction(async (tx) => {
      // Mettre à jour les événements qui utilisent cette catégorie pour les détacher
      await tx.executeSql(
        'UPDATE events SET category_id = NULL WHERE category_id = ?',
        [categoryId],
      );
      
      // Supprimer la catégorie
      await tx.executeSql('DELETE FROM categories WHERE id = ?', [categoryId]);
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
