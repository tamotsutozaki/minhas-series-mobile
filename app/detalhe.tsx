import { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  deleteSerie,
  getSerieById,
  toggleSerieConcluida,
} from '../src/database/serieRepository';
import { Serie } from '../src/types/serie';

export default function Detalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = Array.isArray(id) ? id[0] : id;
  const serieId = idParam === undefined ? null : Number(idParam);

  const [serie, setSerie] = useState<Serie | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (serieId === null || !Number.isInteger(serieId) || serieId <= 0) {
        setSerie(null);
        setErro('Série inválida.');
        setCarregando(false);
        return;
      }

      const idDaSerie = serieId;
      let telaAtiva = true;
      setCarregando(true);
      setErro('');

      async function carregarSerie() {
        try {
          const encontrada = await getSerieById(idDaSerie);

          if (!telaAtiva) {
            return;
          }

          setSerie(encontrada);
          if (encontrada === null) {
            setErro('Série não encontrada.');
          }
        } catch {
          if (telaAtiva) {
            setSerie(null);
            setErro('Não foi possível carregar a série.');
          }
        } finally {
          if (telaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarSerie();

      return () => {
        telaAtiva = false;
      };
    }, [serieId])
  );

  async function alternarStatus() {
    if (serie === null) {
      return;
    }

    setProcessando(true);

    try {
      await toggleSerieConcluida(serie.id);
      setSerie((atual) =>
        atual === null
          ? null
          : { ...atual, concluida: atual.concluida === 1 ? 0 : 1 }
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o status da série.');
    } finally {
      setProcessando(false);
    }
  }

  function confirmarExclusao() {
    if (serie === null) {
      return;
    }

    Alert.alert(
      'Excluir série',
      `Tem certeza que deseja excluir "${serie.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setProcessando(true);

            try {
              await deleteSerie(serie.id);
              router.back();
            } catch {
              setProcessando(false);
              Alert.alert('Erro', 'Não foi possível excluir a série.');
            }
          },
        },
      ]
    );
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-gray-500">Carregando detalhes...</Text>
      </View>
    );
  }

  if (serie === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-center text-lg font-semibold text-gray-800">{erro}</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-blue-600 px-6 py-3"
        >
          <Text className="font-bold text-white">Voltar para a lista</Text>
        </Pressable>
      </View>
    );
  }

  const concluida = serie.concluida === 1;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-5">
      <Stack.Screen options={{ title: serie.titulo }} />

      <View
        className={`rounded-2xl border p-5 ${
          concluida ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-blue-50'
        }`}
      >
        <Text className="text-2xl font-bold text-gray-900">{serie.titulo}</Text>
        <Text
          className={`mt-2 self-start rounded-full px-3 py-1 text-sm font-semibold ${
            concluida ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
          }`}
        >
          {concluida ? 'Concluída' : 'Assistindo'}
        </Text>
      </View>

      <View className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <Campo rotulo="Plataforma" valor={serie.plataforma} />
        <Campo
          rotulo="Temporadas assistidas"
          valor={`${serie.temporadas} temporada${serie.temporadas === 1 ? '' : 's'}`}
        />
        <Campo
          rotulo="Nota"
          valor={serie.nota === null ? 'Sem nota' : `${serie.nota}/5`}
        />
        <Campo rotulo="Status" valor={concluida ? 'Concluída' : 'Assistindo'} />
        <Campo
          rotulo="Cadastrada em"
          valor={new Date(serie.createdAt).toLocaleString('pt-BR')}
          ultimo
        />
      </View>

      <View className="mt-6 gap-3">
        <Pressable
          onPress={alternarStatus}
          disabled={processando}
          className={`rounded-xl py-4 ${
            processando ? 'bg-green-300' : 'bg-green-600'
          }`}
        >
          <Text className="text-center font-bold text-white">
            {concluida ? 'Voltar para assistindo' : 'Marcar como concluída'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/form?id=${serie.id}`)}
          disabled={processando}
          className="rounded-xl border border-blue-600 py-4"
        >
          <Text className="text-center font-bold text-blue-700">Editar</Text>
        </Pressable>

        <Pressable
          onPress={confirmarExclusao}
          disabled={processando}
          className="rounded-xl border border-red-300 bg-red-50 py-4"
        >
          <Text className="text-center font-bold text-red-700">Excluir</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

interface CampoProps {
  rotulo: string;
  valor: string;
  ultimo?: boolean;
}

function Campo({ rotulo, valor, ultimo = false }: CampoProps) {
  return (
    <View className={`p-4 ${ultimo ? '' : 'border-b border-gray-200'}`}>
      <Text className="text-sm font-medium text-gray-500">{rotulo}</Text>
      <Text className="mt-1 text-base text-gray-900">{valor}</Text>
    </View>
  );
}
