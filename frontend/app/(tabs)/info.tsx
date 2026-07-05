import { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { getDailyTip } from '@/src/daily-tips';

const BOOK_URL = 'https://amzn.eu/d/axdPyAN';
const BUNDLE_WHATSAPP =
  "https://wa.me/393891748612?text=Ciao%20Eliseo%2C%20voglio%20iniziare%20con%20il%20Bundle%20Libro%20%2B%20Mini-Guida.";
const CONSULT_WHATSAPP =
  'https://wa.me/393891748612?text=Ciao%20Eliseo%2C%20vorrei%20info%20sulla%20consulenza%201%3A1';
const SITE_URL = 'https://biohackingquotidiano.com/';

export default function InfoScreen() {
  const { tip } = useMemo(() => getDailyTip(), []);
  const scrollRef = useRef<ScrollView | null>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      return () => {};
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/brand/logo-symbol.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandWordmark}>Biohacking Quotidiano</Text>
          </View>

          <Text style={styles.title}>Info</Text>
          <Text style={styles.subtitle}>Cos&apos;è Daily Reset e come usarlo.</Text>

          {/* CONSIGLIO DEL GIORNO */}
          <View style={[styles.tipCard, theme.shadow.lifted]} testID="daily-tip-card">
            <View style={styles.tipHeader}>
              <View style={styles.tipBadge}>
                <Ionicons name="bulb-outline" size={14} color="#fff" />
                <Text style={styles.tipBadgeText}>Consiglio del giorno</Text>
              </View>
              <Text style={styles.tipDate}>{formatToday()}</Text>
            </View>
            <Text style={styles.tipText} testID="daily-tip-text">{tip}</Text>
          </View>

          {/* Cos'è Daily Reset */}
          <View style={[styles.card, theme.shadow.card]}>
            <Text style={styles.body}>
              <Text style={styles.strong}>Daily Reset</Text> è uno strumento sperimentale di
              Biohacking Quotidiano. Serve a trasformare la giornata in informazioni pratiche:
              cosa ha funzionato, cosa ha pesato e cosa correggere domani.
            </Text>
          </View>

          <SectionTitle icon="compass-outline" title="Come funziona" />
          <View style={[styles.card, theme.shadow.card]}>
            <Row text="Rispondi a un check-in serale in 4 sezioni." />
            <Row text="Ricevi un reset con pattern, aggiustamenti e una micro-azione." />
            <Row text="Copia, salva o rivedi i tuoi reset nello Storico." />
          </View>

          <SectionTitle icon="alert-circle-outline" title="Cosa non è" />
          <View style={[styles.card, theme.shadow.card]}>
            <Row text="Non è un tracker di abitudini." />
            <Row text="Non è un&apos;app medica o diagnostica." />
            <Row text="Non prescrive integratori né terapie." />
          </View>

          {/* ECOSISTEMA — Libro / Bundle / Consulenza */}
          <SectionTitle icon="leaf-outline" title="Vai più a fondo con Biohacking Quotidiano" />

          <Pressable
            onPress={() => Linking.openURL(BOOK_URL)}
            style={({ pressed }) => [styles.offerCard, theme.shadow.card, pressed && { opacity: 0.92 }]}
            testID="offer-book"
          >
            <View style={styles.offerIcon}>
              <Ionicons name="book-outline" size={20} color={theme.color.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>Il libro</Text>
              <Text style={styles.offerSubtitle}>
                Il metodo completo, chiaro e pratico. Azioni concrete, zero teoria inutile.
              </Text>
              <Text style={styles.offerCta}>Acquista su Amazon →</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(BUNDLE_WHATSAPP)}
            style={({ pressed }) => [
              styles.offerCard,
              styles.offerCardAccent,
              theme.shadow.card,
              pressed && { opacity: 0.92 },
            ]}
            testID="offer-bundle"
          >
            <View style={[styles.offerIcon, styles.offerIconAccent]}>
              <Ionicons name="star-outline" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.recommendedRow}>
                <Text style={styles.offerTitleAccent}>Bundle: Libro + Mini-Guida</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>consigliato</Text>
                </View>
              </View>
              <Text style={styles.offerSubtitleAccent}>
                Un vademecum personalizzato sui tuoi obiettivi e sul tuo ritmo quotidiano.
              </Text>
              <Text style={styles.offerCtaAccent}>Scrivi su WhatsApp →</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(CONSULT_WHATSAPP)}
            style={({ pressed }) => [styles.offerCard, theme.shadow.card, pressed && { opacity: 0.92 }]}
            testID="offer-consult"
          >
            <View style={styles.offerIcon}>
              <Ionicons name="chatbubbles-outline" size={20} color={theme.color.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>Consulenza 1:1</Text>
              <Text style={styles.offerSubtitle}>
                Sessione personalizzata: strategia e protocolli su misura, su appuntamento.
              </Text>
              <Text style={styles.offerCta}>Richiedi info →</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(SITE_URL)}
            style={styles.siteLink}
            testID="info-website-link"
          >
            <Ionicons name="open-outline" size={16} color={theme.color.brand} />
            <Text style={styles.siteLinkText}>biohackingquotidiano.com</Text>
          </Pressable>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle-outline" size={16} color={theme.color.textFaint} />
            <Text style={styles.disclaimerText}>
              Questo reset offre indicazioni generali di stile di vita. Non sostituisce una
              valutazione medica, nutrizionale o psicologica.
            </Text>
          </View>

          <Text style={styles.version}>MVP v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={14} color={theme.color.brand} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Row({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function formatToday() {
  try {
    return new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
    });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { paddingBottom: 48 },
  container: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  logo: { width: 28, height: 28 },
  brandWordmark: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.color.brandDark,
    letterSpacing: 0.2,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.color.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: theme.color.textMuted, marginBottom: theme.spacing.sm },

  // Consiglio del giorno
  tipCard: {
    backgroundColor: theme.color.brandDark,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.color.brand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  tipBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tipDate: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '500',
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },

  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    gap: 10,
  },
  body: { fontSize: 15, color: theme.color.text, lineHeight: 22, flex: 1 },
  strong: { fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: theme.spacing.md },
  sectionIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.color.brandSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.color.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: theme.color.brand,
    marginTop: 9,
  },

  // Offer cards
  offerCard: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  offerCardAccent: {
    backgroundColor: theme.color.brand,
    borderColor: theme.color.brand,
  },
  offerIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerIconAccent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  recommendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  recommendedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  offerTitle: { fontSize: 16, fontWeight: '700', color: theme.color.text, marginBottom: 4 },
  offerTitleAccent: { fontSize: 16, fontWeight: '700', color: '#fff', flexShrink: 1 },
  offerSubtitle: { fontSize: 13, color: theme.color.textMuted, lineHeight: 19 },
  offerSubtitleAccent: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
  offerCta: { fontSize: 13, color: theme.color.brand, fontWeight: '700', marginTop: 8 },
  offerCtaAccent: { fontSize: 13, color: '#fff', fontWeight: '700', marginTop: 8 },

  siteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
  },
  siteLinkText: { fontSize: 13, color: theme.color.brand, fontWeight: '600' },

  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: theme.color.textFaint,
    lineHeight: 18,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.color.textFaint,
    marginTop: theme.spacing.sm,
  },
});
