// Entidade completa, do jeito que fica salva no banco.
export interface Serie {
  id: number;
  titulo: string;
  plataforma: string;
  temporadas: number;
  nota: number | null; // de 1 a 5, ou null quando a pessoa não deu nota
  concluida: number; // 0 ou 1 (SQLite não tem booleano)
  createdAt: string; // ISO 8601, gerado no repositório
}

// O que o usuário informa ao cadastrar uma série nova.
// Sem id/createdAt (o banco e o repositório geram) e sem concluida
// (toda série nova começa como "assistindo").
export interface CreateSerieInput {
  titulo: string;
  plataforma: string;
  temporadas: number;
  nota: number | null;
}

// Campos que o formulário permite editar.
export interface UpdateSerieInput {
  titulo: string;
  plataforma: string;
  temporadas: number;
  nota: number | null;
}

// Opções do filtro da lista.
export type SerieFilter = 'todas' | 'assistindo' | 'concluidas';
