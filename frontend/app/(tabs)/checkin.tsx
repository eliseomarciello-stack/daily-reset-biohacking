import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { ScoreStepper } from '@/src/components/ScoreStepper';
import { ChoiceChips } from '@/src/components/ChoiceChips';
import {
  BODY_FEELING_OPTIONS,
  CAFFEINE_OPTIONS,
  CRAVINGS_OPTIONS,
  ENERGY_LABELS,
  FOCUS_LABELS,
  IMPROVEMENT_OPTIONS,
  LIGHT_OPTIONS,
  MOVEMENT_OPTIONS,
  NUTRITION_OPTIONS,
  ROUTINE_DONE_OPTIONS,
  SLEEP_LABELS,
  STRESS_LABELS,
  TIME_OPTIONS,
} from '@/src/checkin-options';
import { api, ResetInput } from '@/src/api';

type Form = Partial<ResetInput>;

const TOTAL_STEPS = 4;

export default function CheckinScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const scrollToTop = useCallback((animated = true) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated });
    }, 50);
  }, []);

  // Keep progress while user is in the flow, but always reopen the tab from the top.
  useFocusEffect(
    useCallback(() => {
      scrollToTop(false);
      return () => {};
    }, [scrollToTop]),
  );

  useEffect(() => {
    scrollToTop();
  }, [step, scrollToTop]);

  const update = <K extends keyof ResetInput>(key: K, value: ResetInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const stepValid = useMemo(() => {
    if (step === 1) return !!(form.energy_score && form.focus_score && form.stress_score);
    if (step === 2) return !!(form.sleep_score && form.movement_type && form.body_feeling);
    if (step === 3)
      return !!(form.nutrition_status && form.cravings_level && form.caffeine_use && form.natural_light);
    if (step === 4) return !!(form.routine_done && form.improvement_area && form.available_time);
    return false;
  }, [form, step]);

  const goNext = () => {
    if (!stepValid) {
      setError('Completa questa risposta per generare il tuo reset.');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      scrollToTop();
    } else void submit();
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollToTop();
    } else router.replace('/(tabs)');
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const reset = await api.createReset(form as ResetInput);
      // Reset local form and navigate
      setForm({});
      setStep(1);
      router.push({ pathname: '/result', params: { id: reset.id } });
    } catch {
      setError('Qualcosa non ha funzionato. Riprova tra poco.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn} testID="checkin-back-button">
            <Ionicons name="chevron-back" size={22} color={theme.color.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepLabel} testID="checkin-step-label">Step {step} di {TOTAL_STEPS}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
            </View>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {step === 1 && (
              <Section title="Energia e mente" subtitle="Come è andata dentro di te oggi.">
                <Field label="Energia oggi" testID="field-energy">
                  <ScoreStepper
                    testIDPrefix="energy"
                    value={form.energy_score}
                    onChange={(v) => update('energy_score', v)}
                    labels={ENERGY_LABELS}
                  />
                </Field>
                <Field label="Focus mentale oggi" testID="field-focus">
                  <ScoreStepper
                    testIDPrefix="focus"
                    value={form.focus_score}
                    onChange={(v) => update('focus_score', v)}
                    labels={FOCUS_LABELS}
                  />
                </Field>
                <Field label="Stress percepito" testID="field-stress">
                  <ScoreStepper
                    testIDPrefix="stress"
                    value={form.stress_score}
                    onChange={(v) => update('stress_score', v)}
                    labels={STRESS_LABELS}
                  />
                </Field>
              </Section>
            )}

            {step === 2 && (
              <Section title="Corpo e recupero" subtitle="Come sta il corpo a fine giornata.">
                <Field label="Qualità del sonno della notte precedente" testID="field-sleep">
                  <ScoreStepper
                    testIDPrefix="sleep"
                    value={form.sleep_score}
                    onChange={(v) => update('sleep_score', v)}
                    labels={SLEEP_LABELS}
                  />
                </Field>
                <Field label="Movimento oggi" testID="field-movement">
                  <ChoiceChips
                    testIDPrefix="movement"
                    options={MOVEMENT_OPTIONS}
                    value={form.movement_type}
                    onChange={(v) => update('movement_type', v)}
                  />
                </Field>
                <Field label="Sensazione fisica a fine giornata" testID="field-body">
                  <ChoiceChips
                    testIDPrefix="body"
                    options={BODY_FEELING_OPTIONS}
                    value={form.body_feeling}
                    onChange={(v) => update('body_feeling', v)}
                  />
                </Field>
              </Section>
            )}

            {step === 3 && (
              <Section title="Alimentazione e stile di vita" subtitle="Cosa hai messo dentro oggi.">
                <Field label="Com'è stata l'alimentazione oggi?" testID="field-nutrition">
                  <ChoiceChips
                    testIDPrefix="nutrition"
                    options={NUTRITION_OPTIONS}
                    value={form.nutrition_status}
                    onChange={(v) => update('nutrition_status', v)}
                  />
                </Field>
                <Field label="Fame o craving durante la giornata" testID="field-cravings">
                  <ChoiceChips
                    testIDPrefix="cravings"
                    options={CRAVINGS_OPTIONS}
                    value={form.cravings_level}
                    onChange={(v) => update('cravings_level', v)}
                  />
                </Field>
                <Field label="Caffeina oggi" testID="field-caffeine">
                  <ChoiceChips
                    testIDPrefix="caffeine"
                    options={CAFFEINE_OPTIONS}
                    value={form.caffeine_use}
                    onChange={(v) => update('caffeine_use', v)}
                  />
                </Field>
                <Field label="Esposizione a luce naturale" testID="field-light">
                  <ChoiceChips
                    testIDPrefix="light"
                    options={LIGHT_OPTIONS}
                    value={form.natural_light}
                    onChange={(v) => update('natural_light', v)}
                  />
                </Field>
              </Section>
            )}

            {step === 4 && (
              <Section title="Routine e intenzione" subtitle="Uno sguardo verso domani.">
                <Field label="Hai fatto almeno una routine biohacking oggi?" testID="field-routine">
                  <ChoiceChips
                    testIDPrefix="routine"
                    options={ROUTINE_DONE_OPTIONS}
                    value={form.routine_done}
                    onChange={(v) => update('routine_done', v)}
                  />
                </Field>
                <Field label="Quale area vuoi migliorare domani?" testID="field-improvement">
                  <ChoiceChips
                    testIDPrefix="improvement"
                    options={IMPROVEMENT_OPTIONS}
                    value={form.improvement_area}
                    onChange={(v) => update('improvement_area', v)}
                  />
                </Field>
                <Field label="Tempo realistico disponibile domani" testID="field-time">
                  <ChoiceChips
                    testIDPrefix="time"
                    options={TIME_OPTIONS}
                    value={form.available_time}
                    onChange={(v) => update('available_time', v)}
                  />
                </Field>
              </Section>
            )}

            {error && (
              <View style={styles.errorBox} testID="checkin-error">
                <Ionicons name="alert-circle-outline" size={18} color={theme.color.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Pressable
              onPress={goBack}
              style={[styles.secondaryButton]}
              testID="checkin-prev-button"
            >
              <Text style={styles.secondaryButtonText}>
                {step === 1 ? 'Annulla' : 'Indietro'}
              </Text>
            </Pressable>
            <Pressable
              onPress={goNext}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9 },
                submitting && { opacity: 0.6 },
              ]}
              testID={step === TOTAL_STEPS ? 'checkin-submit-button' : 'checkin-next-button'}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {step === TOTAL_STEPS ? 'Genera il reset' : 'Avanti'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <View style={{ gap: theme.spacing.lg }}>{children}</View>
    </View>
  );
}

function Field({ label, children, testID }: { label: string; children: React.ReactNode; testID?: string }) {
  return (
    <View testID={testID} style={[styles.fieldCard, theme.shadow.card]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.surface },
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
  stepLabel: {
    fontSize: 12,
    color: theme.color.textMuted,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.pill,
  },
  scroll: { paddingBottom: 120 },
  container: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.color.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.color.textMuted,
    marginTop: 4,
  },
  fieldCard: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBECEA',
    borderColor: '#F1C0BB',
    borderWidth: 1,
    padding: 12,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  errorText: { color: theme.color.error, fontSize: 13, flex: 1 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.surface,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingBottom: Platform.select({ ios: 24, default: 12 }),
    paddingTop: 12,
    paddingHorizontal: theme.spacing.lg,
  },
  footerInner: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.color.brand,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
