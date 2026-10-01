import { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createSerie,
  getSerieById,
  updateSerie,
} from '../src/database/serieRepository';

const NOTAS = [1, 2, 3, 4, 5];

export default function Form() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = Array.isArray(id) ? id[0] : id;
  const editando = idParam !== undefined;
  const serieId = editando ? Number(idParam) : null;

  const [titulo, setTitulo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [temporadas, setTemporadas] = useState('0');
  const [nota, setNota] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) {
      return;
    }

    if (serieId === null || !Number.isInteger(serieId) || serieId <= 0) {
      setErro('Série inválida.');
      setCarregando(false);
      return;
    }

    const idDaSerie = serieId;
    let telaAtiva = true;

    async function carregarSerie() {
      try {
        const serie = await getSerieById(idDaSerie);

        if (!telaAtiva) {
          return;
        }

        if (serie === null) {
          setErro('Série não encontrada.');
          return;
        }

        setTitulo(serie.titulo);
        setPlataforma(serie.plataforma);
        setTemporadas(String(serie.temporadas));
        setNota(serie.nota);
      } catch {
        if (telaAtiva) {
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
  }, [editando, serieId]);

  async function salvar() {
    const tituloLimpo = titulo.trim();
    const plataformaLimpa = plataforma.trim();
    const totalTemporadas = Number(temporadas);

    if (tituloLimpo === '' || plataformaLimpa === '') {
      setErro('Preencha o título e a plataforma.');
      return;
    }

    if (
      temporadas.trim() === '' ||
      !Number.isInteger(totalTemporadas) ||
      totalTemporadas < 0
    ) {
      setErro('Temporadas precisa ser um número inteiro maior ou igual a zero.');
      return;
    }

    if (editando && (serieId === null || !Number.isInteger(serieId) || serieId <= 0)) {
      setErro('Série inválida.');
      return;
    }

    setErro('');
    setSalvando(true);

    const dados = {
      titulo: tituloLimpo,
      plataforma: plataformaLimpa,
      temporadas: totalTemporadas,
      nota,
    };

    try {
      if (editando && serieId !== null) {
        await updateSerie(serieId, dados);
      } else {
        await createSerie(dados);
      }

      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a série. Tente novamente.');
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-gray-500">Carregando série...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: editando ? 'Editar série' : 'Nova série' }} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-5"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="mb-2 font-semibold text-gray-800">Título</Text>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex.: Ruptura"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
            editable={!salvando}
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-800">Plataforma</Text>
          <TextInput
            value={plataforma}
            onChangeText={setPlataforma}
            placeholder="Ex.: Apple TV+"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
            editable={!salvando}
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-800">Temporadas assistidas</Text>
          <TextInput
            value={temporadas}
            onChangeText={setTemporadas}
            placeholder="0"
            keyboardType="numeric"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
            editable={!salvando}
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-800">Nota (opcional)</Text>
          <View className="flex-row gap-2">
            {NOTAS.map((valor) => {
              const selecionada = nota !== null && valor <= nota;

              return (
                <Pressable
                  key={valor}
                  onPress={() => setNota(nota === valor ? null : valor)}
                  className={`h-12 w-12 items-center justify-center rounded-xl border ${
                    selecionada
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  disabled={salvando}
                  accessibilityRole="button"
                  accessibilityLabel={`Dar nota ${valor}`}
                >
                  <Text
                    className={`text-3xl ${
                      selecionada ? 'text-amber-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-2 text-sm text-gray-500">
            {nota === null
              ? 'Nenhuma nota selecionada.'
              : `Nota ${nota}/5. Toque novamente na estrela ${nota} para remover.`}
          </Text>
        </View>

        {erro !== '' && (
          <Text className="rounded-lg bg-red-50 p-3 text-red-700">{erro}</Text>
        )}

        <Pressable
          onPress={salvar}
          disabled={salvando || (editando && erro === 'Série não encontrada.')}
          className={`mt-2 rounded-xl py-4 ${
            salvando ? 'bg-blue-300' : 'bg-blue-600'
          }`}
        >
          <Text className="text-center text-base font-bold text-white">
            {salvando ? 'Salvando...' : 'Salvar série'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
