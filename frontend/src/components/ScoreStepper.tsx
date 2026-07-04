import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/src/theme';

type Props = {
  value?: number;
  onChange: (v: number) => void;
  labels: string[]; // length 5
  testIDPrefix?: string;
};

// Touch-friendly 1–5 stepper. Renders 5 pill buttons + shows selected label.
export function ScoreStepper({ value, onChange, labels, testIDPrefix }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              testID={testIDPrefix ? `${testIDPrefix}-${n}` : undefined}
              onPress={() => onChange(n)}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.labelEdge}>{labels[0]}</Text>
        <Text style={styles.labelEdge}>{labels[4]}</Text>
      </View>
      {value ? (
        <Text style={styles.selectedLabel} testID={testIDPrefix ? `${testIDPrefix}-selected-label` : undefined}>
          {labels[value - 1]}
        </Text>
      ) : (
        <Text style={styles.placeholderLabel}>Seleziona un valore</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: theme.color.brand,
    borderColor: theme.color.brand,
  },
  pillText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color.textMuted,
  },
  pillTextSelected: { color: '#fff' },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  labelEdge: {
    fontSize: 12,
    color: theme.color.textFaint,
  },
  selectedLabel: {
    fontSize: 13,
    color: theme.color.brand,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  placeholderLabel: {
    fontSize: 13,
    color: theme.color.textFaint,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
});
