import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import SQLite from 'react-native-sqlite-storage';

// Initialiser SQLite
SQLite.enablePromise(true);

interface DatabaseContextType {
  database: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider = ({children}: DatabaseProviderProps) => {
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Ouvrir ou créer la base de données
        const db = await SQLite.openDatabase({
          name: 'quotid.db',
          location: 'default',
        });

        // Créer les tables si elles n'existent pas
        await createTables(db);

        setDatabase(db);
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown database error'));
        setIsLoading(false);
      }
    };

    initDatabase();

    // Nettoyer lors du démontage du composant
    return () => {
      if (database) {
        database.close();
      }
    };
  }, []);

  // Fonction pour créer les tables nécessaires
  const createTables = async (db: SQLite.SQLiteDatabase) => {
    // Table des catégories
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        emoji TEXT,
        notification_type TEXT,
        created_at INTEGER NOT NULL
      );
    `);

    // Table des événements
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        location TEXT,
        is_completed INTEGER DEFAULT 0,
        is_recurring INTEGER DEFAULT 0,
        recurrence_rule TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);
    
    // Table pour stocker les statistiques de progression
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        date INTEGER NOT NULL,
        completed_count INTEGER DEFAULT 0,
        planned_count INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);
    
    // Insérer des catégories par défaut si la table est vide
    const [result] = await db.executeSql('SELECT COUNT(*) as count FROM categories');
    const count = result.rows.item(0).count;
    
    if (count === 0) {
      await insertDefaultCategories(db);
    }
  };
  
  // Insérer des catégories par défaut
  const insertDefaultCategories = async (db: SQLite.SQLiteDatabase) => {
    const now = Date.now();
    const defaultCategories = [
      ['Travail', '#3498db', '💼', 'work', now],
      ['Sport', '#e74c3c', '🏃', 'sport', now],
      ['Repas', '#2ecc71', '🍽️', 'meal', now],
      ['Tâches ménagères', '#f39c12', '🧹', 'housework', now],
      ['Sommeil', '#9b59b6', '😴', 'sleep', now],
      ['Soins personnels', '#1abc9c', '🚿', 'selfcare', now],
      ['Soins des animaux', '#f1c40f', '🐾', 'pets', now]
    ];
    
    for (const category of defaultCategories) {
      await db.executeSql(
        'INSERT INTO categories (name, color, emoji, notification_type, created_at) VALUES (?, ?, ?, ?, ?)',
        category
      );
    }
  };

  return (
    <DatabaseContext.Provider value={{database, isLoading, error}}>
      {children}
    </DatabaseContext.Provider>
  );
};
