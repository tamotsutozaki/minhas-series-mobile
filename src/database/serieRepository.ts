import { getDatabase } from './database';
import {
  CreateSerieInput,
  Serie,
  SerieFilter,
  UpdateSerieInput,
} from '../types/serie';

// Lista as séries já filtrando no SQL, da mais recente para a mais antiga.
export async function getSeries(filtro: SerieFilter): Promise<Serie[]> {
  const db = getDatabase();

  if (filtro === 'todas') {
    return db.getAllAsync<Serie>(
      'SELECT * FROM series ORDER BY createdAt DESC'
    );
  }

  const concluida = filtro === 'concluidas' ? 1 : 0;
  return db.getAllAsync<Serie>(
    'SELECT * FROM series WHERE concluida = ? ORDER BY createdAt DESC',
    concluida
  );
}

export async function getSerieById(id: number): Promise<Serie | null> {
  const db = getDatabase();
  return db.getFirstAsync<Serie>('SELECT * FROM series WHERE id = ?', id);
}

export async function createSerie(input: CreateSerieInput): Promise<Serie> {
  const db = getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    'INSERT INTO series (titulo, plataforma, temporadas, nota, concluida, createdAt) VALUES (?, ?, ?, ?, 0, ?)',
    input.titulo,
    input.plataforma,
    input.temporadas,
    input.nota,
    createdAt
  );

  return {
    id: result.lastInsertRowId,
    titulo: input.titulo,
    plataforma: input.plataforma,
    temporadas: input.temporadas,
    nota: input.nota,
    concluida: 0,
    createdAt,
  };
}

export async function updateSerie(
  id: number,
  input: UpdateSerieInput
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE series SET titulo = ?, plataforma = ?, temporadas = ?, nota = ? WHERE id = ?',
    input.titulo,
    input.plataforma,
    input.temporadas,
    input.nota,
    id
  );
}

export async function toggleSerieConcluida(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE series SET concluida = CASE WHEN concluida = 1 THEN 0 ELSE 1 END WHERE id = ?',
    id
  );
}

export async function deleteSerie(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM series WHERE id = ?', id);
}
