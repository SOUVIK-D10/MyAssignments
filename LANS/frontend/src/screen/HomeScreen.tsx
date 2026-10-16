import React from 'react';
import { View, FlatList } from 'react-native';
import { useStore } from '../state/useStore';
import Card from '../components/Card';

export default function HomeScreen() {
  const { leads, theme } = useStore();
  const isDark = theme === 'dark';

  return (
    <View>
      <FlatList
        data={leads}
        keyExtractor={(item, index) => item.leadgen_id + index}
        renderItem={({ item }) => <Card lead={item} isDark={isDark} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}