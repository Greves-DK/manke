import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, type FontWeight } from '@/theme';

type TProps = TextProps & { w?: FontWeight; size?: number; color?: string; style?: StyleProp<TextStyle> };

/** Tekst med appens skrift. */
export function T({ w = 'regular', size = 15, color = colors.ink, style, ...rest }: TProps) {
  return <Text {...rest} style={[{ fontFamily: fonts[w], fontSize: size, color }, style]} />;
}

/** Skærm med rul, sikker top og plads til fanebjælken nederst. */
export function Screen({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 120, gap }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return <View style={[styles.card, dark && { backgroundColor: colors.navy }, style]}>{children}</View>;
}

export function Avatar({ letter, color, size = 32 }: { letter: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <T w="heavy" size={Math.round(size * 0.42)} color="#FFFFFF">
        {letter.slice(0, 1).toUpperCase()}
      </T>
    </View>
  );
}

export function Pill({ text, bg, fg, style }: { text: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' }, style]}>
      <T w="bold" size={12} color={fg}>
        {text}
      </T>
    </View>
  );
}

export function Heading({ children, size = 32 }: { children: ReactNode; size?: number }) {
  return (
    <T w="heavy" size={size} style={{ letterSpacing: -0.8, lineHeight: Math.round(size * 1.12) }} accessibilityRole="header">
      {children}
    </T>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
      <T w="heavy" size={17} accessibilityRole="header">
        {children}
      </T>
      {right}
    </View>
  );
}

export interface SegOption<V extends string> {
  value: V;
  label: string;
}

/** Vælger med 2–3 muligheder, fx "Fryser let / Normal / Sveder let". */
export function Segmented<V extends string>({ options, value, onChange, label }: { options: SegOption<V>[]; value: V; onChange: (v: V) => void; label?: string }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.segment}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segBtn, on && styles.segBtnOn]}
          >
            <T w={on ? 'bold' : 'semibold'} size={14} color={on ? colors.ink : colors.grey}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Lille rund ikonknap, mindst 44 punkter. */
export function IconButton({ onPress, label, children, bg = colors.card, border = true }: { onPress: () => void; label: string; children: ReactNode; bg?: string; border?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        { width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 },
        border && { borderWidth: 1, borderColor: colors.border },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress, disabled, right }: { title: string; onPress: () => void; disabled?: boolean; right?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primary, { opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }]}
    >
      <T w="bold" size={16} color="#FFFFFF">
        {title}
      </T>
      {right}
    </Pressable>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 16 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 22, backgroundColor: colors.segment },
  segBtn: { flex: 1, height: 40, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segBtnOn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#191C2B',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  primary: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
