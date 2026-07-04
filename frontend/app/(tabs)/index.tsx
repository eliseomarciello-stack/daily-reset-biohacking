import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/src/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Brand header */}
          <View style={styles.brandRow} testID="home-brand-row">
            <Image
              source={require('../../assets/brand/logo-symbol.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandWordmark}>Biohacking Quotidiano</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} testID="home-title">Daily Reset</Text>
          <Text style={styles.subtitle} testID="home-subtitle">
            Il check-in serale di Biohacking Quotidiano
          </Text>

          {/* Description card */}
          <View style={[styles.card, theme.shadow.card]}>
            <Text style={styles.cardText}>
              Rispondi a poche domande sulla tua giornata e ricevi un resoconto pratico con un
              piccolo aggiustamento per domani.
            </Text>
          </View>

          {/* Feature bullets */}
          <View style={styles.bullets}>
            <FeatureRow icon="flash-outline" text="Capisci cosa ha influenzato la tua energia" />
            <FeatureRow icon="leaf-outline" text="Ricevi un aggiustamento pratico per domani" />
            <FeatureRow icon="bookmark-outline" text="Salva e rivedi i tuoi reset" />
          </View>

          {/* Positioning */}
          <View style={[styles.cardMuted]}>
            <Text style={styles.cardMutedText}>
              Non è un tracker. È uno strumento per capire cosa ti ha aiutato, cosa ti ha
              appesantito e cosa correggere domani.
            </Text>
          </View>

          {/* Primary CTA */}
          <Pressable
            testID="start-reset-button"
            style={({ pressed }) => [
              styles.primaryButton,
              theme.shadow.lifted,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
            onPress={() => router.push('/(tabs)/checkin')}
          >
            <Text style={styles.primaryButtonText}>Inizia il reset</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>

          <Text style={styles.disclaimer} testID="home-disclaimer">
            Le indicazioni sono generali e non sostituiscono il parere di un professionista
            sanitario.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={theme.color.brand} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.surface },
  scrollContent: { paddingBottom: 32 },
  container: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  logo: { width: 32, height: 32 },
  brandWordmark: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.color.brandDark,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: theme.font.sizes.display,
    fontWeight: '700',
    color: theme.color.text,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.font.sizes.lg,
    color: theme.color.textMuted,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  cardText: {
    fontSize: theme.font.sizes.base,
    color: theme.color.text,
    lineHeight: 22,
  },
  bullets: { marginBottom: theme.spacing.lg, gap: theme.spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: theme.font.sizes.base,
    color: theme.color.text,
    flex: 1,
  },
  cardMuted: {
    backgroundColor: theme.color.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  cardMutedText: {
    fontSize: theme.font.sizes.sm,
    color: theme.color.textMuted,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disclaimer: {
    fontSize: theme.font.sizes.xs,
    color: theme.color.textFaint,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: theme.spacing.md,
  },
});
