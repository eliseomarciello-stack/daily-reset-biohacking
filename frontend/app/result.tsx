import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { theme } from '@/src/theme';
import { api, Reset } from '@/src/api';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [reset, setReset] = useState<Reset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<
    { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; msg: string }
  >({ kind: 'idle' });

  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const scrollToTop = useCallback((animated = true) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated });
    }, 50);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError('Nessun reset selezionato.');
        setLoading(false);
        return;
      }
      try {
        const r = await api.getReset(id);
        if (mounted) {
          setReset(r);
          scrollToTop(false);
        }
      } catch {
        if (mounted) setError('Qualcosa non ha funzionato. Riprova tra poco.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, scrollToTop]);

  useEffect(() => {
    if (!loading && reset) scrollToTop(false);
  }, [loading, reset, scrollToTop]);

  const handleCopy = async () => {
    if (!reset) return;
    const text = buildCopyText(reset);
    await Clipboard.setStringAsync(text);
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 1800);
  };

  const submitEmail = async () => {
    const trimmed = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!validEmail) {
      setEmailStatus({ kind: 'error', msg: "Inserisci un'email valida." });
      return;
    }
    setEmailStatus({ kind: 'sending' });
    try {
      await api.submitEmailLead(trimmed);
      setEmailStatus({ kind: 'ok' });
      setEmail('');
    } catch {
      setEmailStatus({ kind: 'error', msg: 'Qualcosa non ha funzionato. Riprova tra poco.' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.color.brand} />
          <Text style={styles.mutedText}>Genero il tuo reset…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !reset) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.color.error} />
          <Text style={styles.errorText} testID="result-error">
            {error || 'Qualcosa non ha funzionato. Riprova tra poco.'}
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/checkin')} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Rifai il check-in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={styles.backBtn}
            testID="result-close-button"
          >
            <Ionicons name="close" size={22} color={theme.color.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Il tuo Daily Reset</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Pattern hero */}
            <View style={[styles.patternHero, theme.shadow.lifted]} testID="result-pattern">
              <Text style={styles.patternLabel}>Pattern principale</Text>
              <Text style={styles.patternValue}>{reset.generated_pattern}</Text>
              <Text style={styles.patternDate}>{formatDate(reset.created_at)}</Text>
            </View>

            <ResultCard
              testID="result-summary"
              icon="reader-outline"
              title="Resoconto della giornata"
            >
              <Text style={styles.body}>{reset.generated_summary}</Text>
            </ResultCard>

            <ResultCard
              testID="result-worked"
              icon="checkmark-circle-outline"
              title="Cosa ha funzionato"
              accent
            >
              <Text style={styles.body}>{reset.generated_worked}</Text>
            </ResultCard>

            <ResultCard
              testID="result-friction"
              icon="remove-circle-outline"
              title="Cosa ha creato attrito"
            >
              <Text style={styles.body}>{reset.generated_friction}</Text>
            </ResultCard>

            <ResultCard
              testID="result-adjustment"
              icon="compass-outline"
              title="Aggiustamento per domani"
            >
              <Text style={styles.body}>{reset.generated_adjustment}</Text>
            </ResultCard>

            <ResultCard
              testID="result-micro-action"
              icon="flash-outline"
              title="Micro-azione prioritaria"
              accent
            >
              <Text style={styles.body}>{reset.generated_micro_action}</Text>
            </ResultCard>

            <ResultCard
              testID="result-avoidance"
              icon="alert-circle-outline"
              title="Cosa evitare domani"
            >
              <Text style={styles.body}>{reset.generated_avoidance}</Text>
            </ResultCard>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable onPress={handleCopy} style={styles.actionButton} testID="copy-reset-button">
                <Ionicons
                  name={copyState === 'copied' ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={theme.color.brand}
                />
                <Text style={styles.actionButtonText}>
                  {copyState === 'copied' ? 'Copiato' : 'Copia reset'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.replace('/(tabs)/checkin')}
                style={styles.actionButtonPrimary}
                testID="restart-checkin-button"
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.actionButtonPrimaryText}>Rifai il check-in</Text>
              </Pressable>
            </View>

            {/* Email lead */}
            <View style={[styles.emailCard, theme.shadow.card]}>
              <Text style={styles.emailTitle}>Vuoi ricevere aggiornamenti sul progetto?</Text>
              <Text style={styles.emailSubtitle}>
                Lasciaci la tua email. Zero spam, solo cose utili di Biohacking Quotidiano.
              </Text>
              <TextInput
                testID="email-input"
                placeholder="la-tua@email.it"
                placeholderTextColor={theme.color.textFaint}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailStatus.kind === 'error') setEmailStatus({ kind: 'idle' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.emailInput}
                editable={emailStatus.kind !== 'sending'}
              />
              {emailStatus.kind === 'error' && (
                <Text style={styles.emailError} testID="email-error">{emailStatus.msg}</Text>
              )}
              {emailStatus.kind === 'ok' && (
                <Text style={styles.emailOk} testID="email-ok">
                  Email salvata in locale per il test. Per una raccolta reale collegheremo un form esterno.
                </Text>
              )}
              <Pressable
                onPress={submitEmail}
                disabled={emailStatus.kind === 'sending'}
                style={[styles.emailButton, emailStatus.kind === 'sending' && { opacity: 0.7 }]}
                testID="email-submit-button"
              >
                {emailStatus.kind === 'sending' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.emailButtonText}>Lascia la tua email</Text>
                )}
              </Pressable>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimerBox} testID="result-disclaimer">
              <Ionicons name="information-circle-outline" size={16} color={theme.color.textFaint} />
              <Text style={styles.disclaimerText}>
                Questo reset offre indicazioni generali di stile di vita. Non sostituisce una
                valutazione medica, nutrizionale o psicologica.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ResultCard({
  title,
  icon,
  children,
  accent,
  testID,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  accent?: boolean;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        theme.shadow.card,
        accent && { borderColor: theme.color.brandSoftBorder, backgroundColor: '#F6FBFA' },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, accent && { backgroundColor: theme.color.brand }]}>
          <Ionicons name={icon} size={16} color={accent ? '#fff' : theme.color.brand} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={{ paddingTop: 8 }}>{children}</View>
    </View>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function buildCopyText(r: Reset): string {
  const lines = [
    `Daily Reset — ${formatDate(r.created_at)}`,
    ``,
    `Pattern: ${r.generated_pattern}`,
    ``,
    `Resoconto della giornata`,
    r.generated_summary,
    ``,
    `Cosa ha funzionato`,
    r.generated_worked,
    ``,
    `Cosa ha creato attrito`,
    r.generated_friction,
    ``,
    `Aggiustamento per domani`,
    r.generated_adjustment,
    ``,
    `Micro-azione prioritaria`,
    r.generated_micro_action,
    ``,
    `Cosa evitare domani`,
    r.generated_avoidance,
    ``,
    `— Biohacking Quotidiano`,
  ];
  return lines.join('\n');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  mutedText: { color: theme.color.textMuted },
  errorText: { color: theme.color.error, textAlign: 'center' },
  retryBtn: {
    marginTop: 12,
    backgroundColor: theme.color.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.card,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: theme.color.text,
    textAlign: 'center',
  },
  scroll: { paddingBottom: 48 },
  container: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  patternHero: {
    backgroundColor: theme.color.brandDark,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  patternLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  patternValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  patternDate: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.color.text,
    flex: 1,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: theme.color.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.color.brand,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.card,
  },
  actionButtonText: { color: theme.color.brand, fontWeight: '600', fontSize: 15 },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.color.brand,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  actionButtonPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  emailCard: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    gap: 10,
    marginTop: theme.spacing.md,
  },
  emailTitle: { fontSize: 15, fontWeight: '700', color: theme.color.text },
  emailSubtitle: { fontSize: 13, color: theme.color.textMuted, lineHeight: 19 },
  emailInput: {
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.color.text,
  },
  emailError: { color: theme.color.error, fontSize: 12 },
  emailOk: { color: theme.color.success, fontSize: 13, fontWeight: '600' },
  emailButton: {
    backgroundColor: theme.color.brandDark,
    borderRadius: theme.radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emailButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: theme.color.textFaint,
    lineHeight: 18,
  },
});
