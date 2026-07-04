import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/src/theme';

export default function InfoScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
            <Row text="Non è un'app medica o diagnostica." />
            <Row text="Non prescrive integratori né terapie." />
          </View>

          <SectionTitle icon="link-outline" title="Ecosistema" />
          <Pressable
            onPress={() => Linking.openURL('https://biohackingquotidiano.com/')}
            style={[styles.linkCard, theme.shadow.card]}
            testID="info-website-link"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>biohackingquotidiano.com</Text>
              <Text style={styles.linkSubtitle}>Libro, bundle personalizzato e consulenza 1:1.</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={theme.color.brand} />
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
  linkCard: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: { fontSize: 15, fontWeight: '700', color: theme.color.brand },
  linkSubtitle: { fontSize: 13, color: theme.color.textMuted, marginTop: 2 },
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
