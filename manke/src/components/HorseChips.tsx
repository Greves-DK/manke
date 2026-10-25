import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView } from 'react-native';
import { useApp } from '@/state/AppState';
import { colors, horseColors, shadow } from '@/theme';
import { Avatar, T } from './ui';

/** Vælg hest øverst på skærmen. Hver hest har sin egen farve. */
export function HorseChips({ onAdd }: { onAdd?: () => void }) {
  const { horses, selected, selectHorse } = useApp();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
    >
      {horses.map((h) => {
        const on = h.id === selected.id;
        const c = horseColors(h.colorIndex);
        return (
          <Pressable
            key={h.id}
            onPress={() => selectHorse(h.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={h.name}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 44,
                paddingLeft: 4,
                paddingRight: 14,
                borderRadius: 22,
                borderWidth: 2,
                borderColor: on ? c.color : colors.border,
                backgroundColor: on ? '#FFFFFF' : 'transparent',
              },
              on && shadow,
            ]}
          >
            <Avatar letter={h.name} color={c.color} size={32} />
            <T w={on ? 'bold' : 'semibold'} size={15}>
              {h.name}
            </T>
          </Pressable>
        );
      })}
      {onAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Tilføj hest"
          style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B9BDD0', alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="plus" size={20} color={colors.accent} />
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
