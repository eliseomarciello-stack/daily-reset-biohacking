import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/src/theme';

type Props = {
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  testIDPrefix?: string;
};

export function ChoiceChips({ options, value, onChange, testIDPrefix }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt}
            testID={testIDPrefix ? `${testIDPrefix}-${opt.replace(/\s+/g, '-').toLowerCase()}` : undefined}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              selected ? styles.chipSelected : styles.chipDefault,
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipDefault: {
    backgroundColor: theme.color.surfaceMuted,
    borderColor: theme.color.border,
  },
  chipSelected: {
    backgroundColor: theme.color.brandSoft,
    borderColor: theme.color.brand,
  },
  chipText: {
    fontSize: 14,
    color: theme.color.textMuted,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.color.brand,
    fontWeight: '600',
  },
});
