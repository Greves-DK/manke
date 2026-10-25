import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { T } from './ui';

const LABELS: Record<string, string> = {
  index: 'Hjem',
  daekken: 'Dækken',
  paamindelser: 'Påmindelser',
  heste: 'Heste',
};

function icon(name: string, color: string): ReactNode {
  switch (name) {
    case 'index':
      return <Feather name="home" size={22} color={color} />;
    case 'daekken':
      return <Feather name="thermometer" size={22} color={color} />;
    case 'paamindelser':
      return <Feather name="bell" size={22} color={color} />;
    default:
      return <MaterialCommunityIcons name="horseshoe" size={22} color={color} />;
  }
}

interface RouteLike {
  key: string;
  name: string;
}

/** Svævende fanebjælke i bunden, som i designet. Props kommer fra expo-router's Tabs. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TabBar({ state, navigation }: { state: { index: number; routes: RouteLike[] }; navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 6 }]}>
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const color = focused ? colors.accent : colors.muted;
          const label = LABELS[route.name] ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={[styles.tab, focused && styles.tabOn]}
            >
              {icon(route.name, color)}
              <T w={focused ? 'bold' : 'semibold'} size={12} color={color} numberOfLines={1}>
                {label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    height: 68,
    borderRadius: 34,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    shadowColor: '#191C2B',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tab: { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabOn: { backgroundColor: colors.accentTint },
});
