import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { runMigrations } from '../src/database/database';

export default function Layout() {
  // Cria a tabela (se ainda não existir) assim que o app abre.
  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Minhas Séries' }} />
      <Stack.Screen name="form" options={{ title: 'Nova série' }} />
      <Stack.Screen name="detalhe" options={{ title: 'Detalhe' }} />
    </Stack>
  );
}
