import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { runMigrations } from '../src/database/database';

export default function Layout() {
  const [bancoPronto, setBancoPronto] = useState(false);
  const [erro, setErro] = useState('');

  // Só monta as telas depois que a tabela estiver pronta para uso.
  useEffect(() => {
    let layoutAtivo = true;

    runMigrations()
      .then(() => {
        if (layoutAtivo) {
          setBancoPronto(true);
        }
      })
      .catch(() => {
        if (layoutAtivo) {
          setErro('Não foi possível iniciar o banco de dados.');
        }
      });

    return () => {
      layoutAtivo = false;
    };
  }, []);

  if (erro !== '') {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-center text-red-700">{erro}</Text>
      </View>
    );
  }

  if (!bancoPronto) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-gray-500">Preparando banco de dados...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Minhas Séries' }} />
      <Stack.Screen name="form" options={{ title: 'Nova série' }} />
      <Stack.Screen name="detalhe" options={{ title: 'Detalhe' }} />
    </Stack>
  );
}
