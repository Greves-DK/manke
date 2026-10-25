import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar state={props.state} navigation={props.navigation} />}>
      <Tabs.Screen name="index" options={{ title: 'Hjem' }} />
      <Tabs.Screen name="daekken" options={{ title: 'Dækken' }} />
      <Tabs.Screen name="paamindelser" options={{ title: 'Påmindelser' }} />
      <Tabs.Screen name="heste" options={{ title: 'Heste' }} />
    </Tabs>
  );
}
