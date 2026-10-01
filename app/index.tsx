import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getSeries } from '../src/database/serieRepository';
import { Serie, SerieFilter } from '../src/types/serie';

const FILTROS: { valor: SerieFilter; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'assistindo', rotulo: 'Assistindo' },
  { valor: 'concluidas', rotulo: 'Concluídas' },
];

export default function Index() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<SerieFilter>('todas');
  const [series, setSeries] = useState<Serie[]>([]);

  const carregar = useCallback(async () => {
    const dados = await getSeries(filtro);
    setSeries(dados);
  }, [filtro]);

  // useFocusEffect recarrega a lista toda vez que a tela volta ao foco
  // (ex.: ao voltar do formulário). O useEffect([]) não faria isso,
  // porque a tela não é montada de novo ao voltar na pilha.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4 flex-row gap-2">
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Pressable
              key={f.valor}
              onPress={() => setFiltro(f.valor)}
              className={`flex-1 rounded-lg py-2 ${ativo ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <Text
                className={`text-center font-semibold ${ativo ? 'text-white' : 'text-gray-700'}`}
              >
                {f.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={series}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-400">
            Nenhuma série por aqui ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/detalhe?id=${item.id}`)}
            className={`mb-3 rounded-xl border p-4 ${
              item.concluida === 1
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text className="text-lg font-bold text-gray-900">{item.titulo}</Text>
            <Text className="text-gray-600">{item.plataforma}</Text>
            <Text className="text-gray-600">
              {item.temporadas} temporada{item.temporadas === 1 ? '' : 's'}
            </Text>
            <Text className="text-gray-600">
              {item.nota === null ? 'Sem nota' : `Nota: ${item.nota}/5`}
            </Text>
            {item.concluida === 1 && (
              <Text className="mt-1 font-semibold text-green-700">✓ Concluída</Text>
            )}
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => router.push('/form')}
        className="mt-2 rounded-xl bg-blue-600 py-4"
      >
        <Text className="text-center text-base font-bold text-white">
          + Nova série
        </Text>
      </Pressable>
    </View>
  );
}
