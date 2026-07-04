import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { api, Reset } from '@/src/api';

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Reset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await api.listResets();
      setItems(list);
    } catch {
      setError('Non sono riuscito a caricare lo storico.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.container}>
          <Text style={styles.title}>Storico</Text>
          <Text style={styles.subtitle}>I tuoi Daily Reset più recenti.</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.color.brand} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={28} color={theme.color.textFaint} />
          <Text style={styles.mutedText}>{error}</Text>
          <Pressable onPress={load} style={styles.retryBtn} testID="history-retry-button">
            <Text style={styles.retryBtnText}>Riprova</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="leaf-outline" size={26} color={theme.color.brand} />
          </View>
          <Text style={styles.emptyTitle} testID="history-empty">Nessun reset ancora</Text>
          <Text style={styles.mutedText}>
            Inizia il tuo primo check-in per costruire lo storico.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/checkin')}
            style={styles.retryBtn}
            testID="history-start-button"
          >
            <Text style={styles.retryBtnText}>Inizia il reset</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.brand} />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/result', params: { id: item.id } })}
              style={({ pressed }) => [
                styles.itemCard,
                theme.shadow.card,
                pressed && { opacity: 0.9 },
              ]}
              testID={`history-item-${item.id}`}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.color.textFaint} />
              </View>
              <Text style={styles.itemPattern}>{item.generated_pattern}</Text>
              <View style={styles.itemMicroRow}>
                <Ionicons name="flash-outline" size={14} color={theme.color.brand} />
                <Text style={styles.itemMicro} numberOfLines={2}>
                  {item.generated_micro_action}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.surface },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md },
  container: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.color.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textMuted,
    marginTop: 4,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.color.text },
  mutedText: { color: theme.color.textMuted, textAlign: 'center' },
  retryBtn: {
    marginTop: 12,
    backgroundColor: theme.color.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 32,
    gap: 12,
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
  },
  itemCard: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDate: { fontSize: 12, color: theme.color.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  itemPattern: { fontSize: 18, fontWeight: '700', color: theme.color.text, marginTop: 4 },
  itemMicroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  itemMicro: { fontSize: 13, color: theme.color.textMuted, flex: 1, lineHeight: 19 },
});
