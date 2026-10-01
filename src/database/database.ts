import * as SQLite from 'expo-sqlite';

// Guarda a conexão para não abrir o banco mais de uma vez (singleton).
let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (db === null) {
    db = SQLite.openDatabaseSync('minhas-series.db');
  }
  return db;
}

// Liga o WAL (melhor desempenho) e cria a tabela se ela ainda não existir.
export async function runMigrations(): Promise<void> {
  const database = getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      plataforma TEXT NOT NULL,
      temporadas INTEGER NOT NULL,
      nota INTEGER,
      concluida INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
}
